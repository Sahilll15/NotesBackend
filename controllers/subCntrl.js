const asyncHandler = require('express-async-handler');
const {Subject} = require('../models/subjectModel');
const {Branch} = require('../models/branchModel')

const getAllSubjects = asyncHandler(async (req,res) => {

    const subs = await Subject.find().populate('branch');
    res.status(200).json(subs);
});

const addSubjects = asyncHandler(async(req,res)=>{
    const {name,branch,sem,teacher} = req.body;
    if(!name || !branch || !sem || !teacher){
        res.status(403);
        throw new Error("All fields are mandatory");
    }
    const branchModel = await Branch.findById(branch);
    if(!branchModel){
        res.status(404);
        throw new Error("Such branch does not exist");
    }
    const newSub = Subject.create({
        name,
        branch,
        sem,
        teacher
    });

    await branchModel.subjects.push(branchModel);
    branchModel.save();

    res.status(201).json(newSub);
});

module.exports = {getAllSubjects, addSubjects}
