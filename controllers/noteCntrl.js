const asyncHandler = require('express-async-handler');
const { Note } = require('../models/noteModel');
const { User } = require('../models/userModel');
const { Branch } = require('../models/branchModel')
const { Subject } = require('../models/subjectModel')
const { ModuleName } = require('../models/moduleModel')

const fs = require('fs');
const path = require('path')
const AWS = require('aws-sdk')
require('dotenv').config();

// aws confioguration
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-2'
})

const s3 = new AWS.S3();

const buyNote = async (req, res) => {
    const { noteId } = req.params;
    const user = req.user.id;
    try {
        const ExistingUser = await User.findById(user)
        if (!ExistingUser) {
            res.status(404).json({ message: "User not found" })
        }
        const note = await Note.findById(noteId);
        if (!note) {
            res.status(404).json({ message: `No note found with id ${noteId}` });
        }
        if (ExistingUser.coins < 10) {
            res.status(404).json({ message: `You don't have enough coins` });
        }
        ExistingUser.coins -= 10;
        ExistingUser.notesBought.push(noteId);
        note.purchased.push(user);
        await note.save();
        await ExistingUser.save();
        res.status(200).json({ message: "Note bought successfully", note: note, user: ExistingUser });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


const getAllNotes = asyncHandler(async (req, res) => {
    try {
        const notes = await Note.find({ acceptedStatus: true });

        const authorID = await notes.map(note => note.author)
        console.log(authorID)

        //get authors
        const authors = await Promise.all(authorID.map(async (author) => {
            const user = await fetchUserById(author)
            return user;
        }))
        console.log(authors)

        const notesWithAuthor = notes.map((note, index) => {
            return {
                ...note._doc,
                author: authors[index]
            }
        })


        res.status(200).json({ message: "Notes fetched successfully", data: notesWithAuthor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


const getNotesById = async (req, res) => {
    try {
        const { noteID } = req.params;
        const note = await Note.findById(noteID);
        if (!note) {
            res.status(401).json({ mssg: "note not found" })
        }
        res.status(200).json({ mssg: "note found", note: note })
    } catch (error) {
        res.status(501).json({ mssg: error })
    }
}

const addNotes = asyncHandler(async (req, res) => {
    try {
        const { name, subject, module, desc } = req.body;

        //add validation
        if (!name || !subject || !module || !desc) {
            return res.status(400).json({ message: "Please enter all the fields" })
        }

        console.log(req.file)
        if (req.body === null) {
            res.status(400).json({ message: "Please upload a file" });
            return;
        }

        const newNote = await Note.create({
            name,
            subject,
            module,
            desc,
            author: req.user.id,
            file: req.file.path,
            fileMimeType: req.file.mimetype,
        });

        const user = await User.findById(req.user.id);
        user.notesUploaded.push(newNote);
        user.coins = (user.coins || 0) + 5;
        await user.save();

        res.status(201).json({
            message: "Note uploaded successfully",
            data: newNote,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



const AcceptRejectNotes = async (req, res) => {
    const { NoteId } = req.params;
    try {
        const user = req.user.id;

        const ExistingUser = await User.findById(user)
        if (!ExistingUser) {
            res.status(404).json({ message: "User not found" })
        }

        if (ExistingUser.role !== "superuser") {
            return res.status(403).json({ message: "You are not authorized to access this route" });
        }
        const note = await Note.findById(NoteId);
        if (!note) {
            return res.status(404).json({ message: `No note found with id ${NoteId}` });
        }
        console.log('note.author' + note.author)
        const Author = await User.findById(note.author);
        console.log(Author.coins)
        if (note.acceptedStatus === false) {
            note.acceptedStatus = true;
            Author.coins += 50;
            try {
                console.log('note upload status ' + note.uploadedToS3)
                if (!note.uploadedToS3) {
                    const fileKey = `${note.name}-${note.file}`;
                    const filePath = note.file;

                    const params = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: fileKey,
                        Body: fs.createReadStream(filePath),
                        ContentType: note.fileMimeType,
                    }
                    console.log(note.uploadedToS3 + " from inside ")

                    const s3Response = await s3.upload(params).promise();
                    console.log("File uploaded to S3:", s3Response.Location);
                    note.file = s3Response.Location;
                    fs.unlinkSync(filePath);
                    note.uploadedToS3 = true;
                }
                console.log('new')
                await note.save();
                await Author.save();
                return res.status(200).json({ message: "Note accepted successfully", note: note });
            } catch (s3Error) {
                console.error("Error uploading file to S3:", s3Error);
                return res.status(500).json({ message: "Error uploading file to S3" });
            }
        } else {
            note.acceptedStatus = false;
            Author.coins -= 50;
            await Author.save()
            await note.save();
            return res.status(200).json({ message: "Note rejected successfully", note: note });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}



const deleteNote = asyncHandler(async (req, res) => {
    try {
        const { noteId } = req.params;
        const user = req.user.id;

        const ExistingUser = await User.findById(user)
        if (!ExistingUser) {
            res.status(404).json({ message: "User not found" })
        }
        console.log(ExistingUser)
        if (ExistingUser.role !== "superuser") {
            res.status(403).json({ message: "You are not authorized to access this route" });
            return;
        }
        const note = await Note.findById(noteId).populate("author");
        if (!note) {
            res.status(404).json({ message: `Unable to find note with id ${noteId}` });
            return;
        }
        note.author?.notesUploaded.pull(noteId);
        await note.author.save();

        fs.unlink(path.join(__dirname, '..', note.file), (err) => {
            if (err) {
                console.error(err);
            }
        });

        await Note.findOneAndDelete({ _id: noteId });

        res.status(200).json({ message: "Note successfully deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const getSingleNote = asyncHandler(async (req, res) => {
    try {
        const { noteId } = req.params;
        const note = await Note.findById(noteId).populate("author");
        if (!note) {
            res.status(404).json({ message: `Unable to find note with id ${noteId}` });
            return;
        }
        res.status(200).json({ message: "Note fetched successfully", data: note });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});



const fetchUserById = async (authorID) => {
    try {
        const user = await User.findById(authorID).select('_id username email coins role');
        return user;
    } catch (error) {
        console.error(error);
        return null;
    }
}



const getNotesAdmin = async (req, res) => {
    try {
        const user = req.user;

        if (user.role === "superuser") {
            const notes = await Note.find();

            //get all the authorid

            const authorID = await notes.map(note => note.author)
            console.log(authorID)

            //get authors
            const authors = await Promise.all(authorID.map(async (author) => {
                const user = await fetchUserById(author)
                return user;
            }))

            const notesWithAuthor = notes.map((note, index) => {
                return {
                    ...note._doc,
                    author: authors[index]
                }
            })

            res.status(200).json({ message: "Notes fetched successfully", data: notesWithAuthor });
        } else {
            console.log("Not authorized to access this route");
            res.status(403).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }

};


const getFormData = async (req, res) => {
    try {
        const getModules = await ModuleName.find();
        const getSubjects = await Subject.find();
        const getBranches = await Branch.find();

        res.status(200).json({ message: "Data fetched successfully", data: { module: getModules, branches: getBranches, subject: getSubjects } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }

}




module.exports = { getAllNotes, addNotes, deleteNote, getSingleNote, getNotesAdmin, AcceptRejectNotes, getFormData, buyNote };
