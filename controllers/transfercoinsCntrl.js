
const asyncHandler = require("express-async-handler");
const { User } = require("../models/userModel");
const { TransferCoin } = require('../models/transfercoinModel')



const transferCoins = asyncHandler(async (req, res) => {
    const { receiverID } = req.params;
    try {
        const { coins } = req.body;
        const senderUserID = req.user.id;

        // Check if receiver ID is provided
        if (!receiverID) {
            return res.status(400).json({ message: "Receiver ID is required" });
        }

        // Check if sender user exists
        const senderUser = await User.findById(senderUserID);
        if (!senderUser) {
            return res.status(400).json({ mssg: "Sender user does not exist" });
        }

        // Check if receiver user exists
        const receiverUser = await User.findById(receiverID);
        if (!receiverUser) {
            return res.status(400).json({ mssg: "Receiver user does not exist" });
        }

        // Check if coins value is valid
        if (!coins || typeof coins !== "number") {
            return res.status(400).json({ message: "Coins should be a valid number" });
        }

        // Check if sender has enough coins
        if (senderUser.coins < coins) {
            return res.status(400).json({ message: "User does not have enough coins" });
        } else if (senderUser.coins < 50) {
            // Limit is 50 to transfer the coins
            return res.status(400).json({ message: "Your coins should be greater than 50" });
        } else {
            // Transfer coins
            senderUser.coins -= coins;
            receiverUser.coins += coins;
            await senderUser.save();
            await receiverUser.save();

            // Save data in transfercoins model
            const newtransferCoin = new TransferCoin({
                sender: {
                    id: senderUser._id,
                    username: senderUser.username,
                },
                receiver: {
                    id: receiverUser._id,
                    username: receiverUser.username,
                },
                coins: coins,
            });
            await newtransferCoin.save();

            return res.status(200).json({
                message: "Coins transferred successfully",
                senderUser: senderUser,
                receiverUser: receiverUser,
                transferCoin: newtransferCoin
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "An error occurred during the coins transfer." });
    }
});


//get transfer coins history
const getTransferCoinsHistory = asyncHandler(async (req, res) => {
    try {
        const transferCoinsHistory = await TransferCoin.find({}).sort({ createdAt: -1 });
        res.status(200).json({ transferCoinsHistory: transferCoinsHistory });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred during the coins transfer." });
    }
});

//get transfer coins history by user
const getTransferCoinsHistoryByUser = asyncHandler(async (req, res) => {
    const { userID } = req.params;
    try {
        const user = await User.findById(userID);
        if (!user) {
            return res.status(400).json({ message: "User does not exist" })
        }

        const transferCoinsHistory = await TransferCoin.find({ $or: [{ "sender.id": userID }, { "receiver.id": userID }] })
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({ transferCoinsHistory: transferCoinsHistory });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred during the coins transfer." });

    }
});


module.exports = {
    transferCoins,
    getTransferCoinsHistory,
    getTransferCoinsHistoryByUser
};
