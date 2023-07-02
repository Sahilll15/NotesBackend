const Router = require('express');
const {getAllNotes, addNotes} = require('../controllers/noteCntrl');
const validateToken = require('../middlewares/validateToken');
const upload = require('../middlewares/upload')
const router = Router();
router.use(validateToken)
router.route('/').get(getAllNotes).post(upload.single('file'),addNotes);

module.exports = router;