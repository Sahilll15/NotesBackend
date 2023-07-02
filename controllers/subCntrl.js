const asyncHandler = require('express-async-handler');
const {Subject} = require('../models/subjectModel');

const getAllSubjects = asyncHandler(async (req,res) => {

    const subs = await Subject.find({});
    res.status(200).json(subs);
});


