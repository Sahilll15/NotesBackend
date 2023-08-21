const asyncHandler = require('express-async-handler');
const { Note } = require('../models/noteModel');
const { User } = require('../models/userModel');
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



const getAllNotes = asyncHandler(async (req, res) => {
    try {
        const notes = await Note.find({ acceptedStatus: true });
        res.status(200).json({ message: "Notes fetched successfully", data: notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const addNotes = asyncHandler(async (req, res) => {
    try {
        const { name, subject, module, desc } = req.body;

        console.log(req.file)

        // const params = {
        //     Bucket: process.env.AWS_BUCKET_NAME,
        //     Key: `${name}-${req.file.originalname}`,
        //     Body: req.file.buffer,
        //     ContentType: req.file.mimetype,
        // }

        // let s3Response;
        // try {
        //     s3Response = await s3.upload(params).promise();
        // } catch (s3Error) {
        //     console.error("Error uploading file to S3:", s3Error);
        //     return res.status(500).json({ msg: "Error uploading file to S3" });
        // }

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
        const user = req.user;
        if (user.role !== "superuser") {
            res.status(403).json({ message: "You are not authorized to access this route" });
            return;
        }
        const note = await Note.findById(NoteId);
        if (!note) {
            res.status(404).json({ message: `No note found with id ${NoteId}` });
            return;
        }
        if (note.acceptedStatus === false) {
            note.acceptedStatus = true;

            const fileKey = `${note.name}-${note.file}`;
            const filePath = note.file;

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileKey,
                Body: fs.createReadStream(filePath),
                ContentType: note.fileMimeType,
            }

            try {
                const s3Response = await s3.upload(params).promise();
                console.log("File uploaded to S3:", s3Response.Location);


                note.file = s3Response.Location;

                await note.save();
                fs.unlinkSync(filePath);

                res.status(200).json({ message: "Note accepted successfully", note: note });
            } catch (s3Error) {
                console.error("Error uploading file to S3:", s3Error);
                return res.status(500).json({ msg: "Error uploading file to S3" });
            }
        } else {
            note.acceptedStatus = false;
            await note.save();
            res.status(200).json({ message: "Note rejected successfully", note: note });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


const deleteNote = asyncHandler(async (req, res) => {
    try {
        const { id: noteId } = req.params;
        const user = req.user;
        if (user.role !== "superuser") {
            res.status(403).json({ message: "You are not authorized to access this route" });
            return;
        }
        const note = await Note.findById(noteId).populate("author");
        if (!note) {
            res.status(404).json({ message: `Unable to find note with id ${noteId}` });
            return;
        }
        note.author.notesUploaded.pull(noteId);
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
        const { id: noteId } = req.params;
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

const getNotesAdmin = async (req, res) => {
    try {
        const user = req.user;

        if (user.role === "superuser") {
            const notes = await Note.find();
            console.log("Notes fetched successfully", notes);
            res.status(200).json({ message: "Notes fetched successfully", data: notes });
        } else {
            console.log("Not authorized to access this route");
            res.status(403).json({ message: "You are not authorized to access this route" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }

};





module.exports = { getAllNotes, addNotes, deleteNote, getSingleNote, getNotesAdmin, AcceptRejectNotes };
