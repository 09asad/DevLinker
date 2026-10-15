const express = require('express');
const Chat = require('../models/chat');
const { userAuth } = require('../middleware/auth');

const chatRouter = express.Router();

chatRouter.get("/chat/:toUserId", userAuth, async (req,res) => {
    const toUserId = req.params.toUserId;
    const userId = req.user._id;

    try{
        let chat = await Chat.findOne({
            participants: {$all: [userId, toUserId]},
        }).populate({
            path: "messages.senderId",
            select: "firstName lastName",
        });

        if(!chat){
            chat = new Chat({
                participants: [userId, toUserId],
                messages: [],
            });
            await chat.save();
        }
        res.json(chat);

    } catch(err){
        console.error(err);
    }
})

module.exports = chatRouter;