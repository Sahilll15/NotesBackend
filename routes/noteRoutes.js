const Router = require('express');
const { getFormData, getAllNotes, addNotes, getSingleNote, deleteNote, getNotesAdmin, AcceptRejectNotes } = require('../controllers/noteCntrl');
const validateToken = require('../middlewares/validateToken');
const upload = require('../middlewares/upload');
const router = Router();

// Middleware to validate token for all routes under this router


router.route('/').get(validateToken, getAllNotes).post(validateToken, upload.single('file'), addNotes);
// router.route('/:id').get(getSingleNote).delete(deleteNote);
router.route('/getnotesAdmin').get(validateToken, getNotesAdmin);
router.route('/acceptreject/:NoteId').put(validateToken, AcceptRejectNotes);
router.route('/getFormData').get(getFormData);
router.get('/getSingleNote/:noteId', getSingleNote)

module.exports = router;
