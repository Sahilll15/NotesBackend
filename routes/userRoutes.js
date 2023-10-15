const Router = require('express');
const router = Router();
const { searchUser, userInfo, getUserProfile, getUsersLeaderBoard, registerUser, getUserInfo, loginUser, verifyemail, sendResetPasswordEmail, resetPassword, editProfile } = require('../controllers/userCntrl');
const validateToken = require('../middlewares/validateToken');
const { ProfileUpload } = require('../middlewares/upload')

router.route('/register').post(registerUser)
router.route('/login').post(loginUser);
router.route('/emailverify/:tokenId').get(verifyemail);
router.route('/get_user_info').get(validateToken, userInfo);
router.route('/reset_email').post(sendResetPasswordEmail);
router.route('/reset_password').post(resetPassword);
router.route('/register').post(registerUser)
router.route('/getUserInfo').get(validateToken, getUserInfo)
router.route('/getUsersLeaderBoard').get(getUsersLeaderBoard)
router.route('/editProfile').post(validateToken, ProfileUpload.single('profile'), editProfile)
router.route('/getUserProfile/:username').get(getUserProfile)
router.route('/searchUser').get(searchUser)


module.exports = router;
