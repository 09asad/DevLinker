const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const connectionRequestModel = require("../models/connectionRqst");
const User = require("../models/user");

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req,res) => {
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["interested","ignored"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message: "Invalid status type: "+ status});
        }

        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(400).send("User not found");
        }

        const existingConnectionRqst = await connectionRequestModel.findOne({
            $or: [                                                                // $or returns documents if any one condition matches
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId },
            ],
        });
        if(existingConnectionRqst){
            return res.status(400).send("Connection Request Already Exists!!!");
        }

        const connectionRequest = new connectionRequestModel({
            fromUserId,
            toUserId,
            status,
        }); 

        const data = await connectionRequest.save();

        if(status === "interested"){
            res.json({
                message: `${req.user.firstName} showed interest in ${toUser.firstName}`,
                data,
            });
        } else {    
            res.json({
                message : `${req.user.firstName} ignored ${toUser.firstName}`,
                data,
            });
        }
    } catch(err){
        res.status(400).send("ERROR : "+ err.message);
    }
});

requestRouter.post("/request/review/:status/:requestId", userAuth, async (req,res) => {
    try{
        const loggedInUser = req.user;
        const {status, requestId} = req.params;

        const allowedStatus = ["accepted","rejected"];
        if(!allowedStatus.includes(status)){
            res.status(400).json({message: "Status not allowed!"});
        }

        const connectionRequest = await connectionRequestModel.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested",
        });
        if(!connectionRequest){
            res.status(404).json({message: "Connection Request not found"});
        }
        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.json({message: "Connection Request "+ status, data});

    } catch(err) {
        res.status(400).json({ message: "Status not allowed!" }); 
    }
});

module.exports = requestRouter;