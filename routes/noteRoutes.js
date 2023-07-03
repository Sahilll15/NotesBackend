const Router = require('express');
const {getAllNotes, addNotes, getSingleNote,deleteNote} = require('../controllers/noteCntrl');
const validateToken = require('../middlewares/validateToken');
const upload = require('../middlewares/upload')
const router = Router();
router.use(validateToken)
router.route('/').get(getAllNotes).post(upload.single('file'),addNotes);
router.route('/:id').get(getSingleNote).delete(deleteNote);

module.exports = router;