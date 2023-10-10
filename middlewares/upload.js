const path = require('path');
const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (
            file.mimetype === 'application/pdf' ||
            file.mimetype === 'application/vnd.ms-powerpoint' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
            file.mimetype === 'application/zip' ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only pdf, docx, zip, ppt, pptx formats are allowed'));
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 40
    }
});

//upload middlw are for the profile
const Imagestorage = multer.memoryStorage(); // Use memory storage to avoid saving to disk

const ProfileUpload = multer({
    storage: Imagestorage,
})


module.exports = {
    upload,
    ProfileUpload
};