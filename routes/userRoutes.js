const Router = require('express');
const router = Router();
const {userInfo , registerUser, loginUser} = require('../controllers/userCntrl');
const validateToken = require('../middlewares/validateToken');
router.route('/register').post(registerUser)
router.route('/login').post(loginUser);
router.route('/get_user_info').get(validateToken, userInfo);


module.exports = router;