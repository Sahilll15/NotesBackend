const Router = require('express');
const router = Router();
const { transferCoins, getTransferCoinsHistory, getTransferCoinsHistoryByUser } = require('../controllers/transfercoinsCntrl');
const validateToken = require('../middlewares/validateToken');

router.post('/transfercoins/:receiverID', validateToken, transferCoins)
router.get('/getAllTransferCoins', validateToken, getTransferCoinsHistory)
router.get('/getTransferCoinsByUser/:userID', validateToken, getTransferCoinsHistoryByUser)





module.exports = router;