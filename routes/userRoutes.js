const Router = require('express');
const router = Router();
const { userInfo, registerUser, loginUser, verifyemail, sendResetPasswordEmail, resetPassword, transferCoins } = require('../controllers/userCntrl');
const validateToken = require('../middlewares/validateToken');
router.route('/register').post(registerUser)
router.route('/login').post(loginUser);
router.route('/emailverify/:tokenId').get(verifyemail);
router.route('/get_user_info').get(validateToken, userInfo);
router.route('/reset_email').post(sendResetPasswordEmail);
router.route('/reset_password').post(resetPassword);
router.route('/transfer_coins/:receiverID').post(validateToken, transferCoins);


module.exports = router;