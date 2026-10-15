const express = require("express");
const userRouter = express.Router();
const {userAuth} = require("../middleware/auth");
const connectionRequestModel = require("../models/connectionRqst");
const User = require("../models/user");

const USER_SAFE_DATA = "firstName lastName photoURL age gender about skills";

// Get all the pending request for the loggedIn user
userRouter.get("/user/request/received", userAuth, async (req,res) => {
    try{
        const loggedInUser = req.user;

        const connectionRequests = await connectionRequestModel.find({
            toUserId: loggedInUser._id,
            status: "interested",
        }).populate("fromUserId", USER_SAFE_DATA);

        res.json({
            message: "Data fetched successfully",
            data: connectionRequests,
        });
    } catch(err){
        req.statusCode(400).send("ERROR : "+ err.message);
    }
});

// Get all the accepted request for the loggedIn user
userRouter.get("/user/connections", userAuth, async (req,res) => {
    try{
        const loggedInUser = req.user;

        const connections = await connectionRequestModel.find({
            $or: [
                {toUserId: loggedInUser._id, status: "accepted"},
                {fromUserId: loggedInUser._id, status: "accepted"},
            ],
        }).populate([
            {path: "fromUserId", select: USER_SAFE_DATA},
            {path: "toUserId", select: USER_SAFE_DATA},
        ]);

        const data = connections.map((row) => {
            if(row.toUserId._id.equals(loggedInUser._id)){
                return row.fromUserId;
            } else {
                return row.toUserId;
            }
        });

        res.json({
            message: "Connections fetched successfully",
            data,  
        });
        
    } catch(err){
        res.status(400).json({message: err.message});
    }
});

// feed API
userRouter.get("/feed", userAuth, async (req,res) => {
    try{
        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page-1) * limit;

        const connectionRequests = await connectionRequestModel.find({
            $or: [
                { fromUserId: loggedInUser._id },
                { toUserId: loggedInUser._id }
            ],
        }).select("fromUserId toUserId");

        const hideUsersFromFeed = new Set();
        connectionRequests.forEach((req) => {
            hideUsersFromFeed.add(req.fromUserId.toString());
            hideUsersFromFeed.add(req.toUserId.toString());
        });

        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFromFeed)} },
                { _id: { $ne: loggedInUser._id} },
            ],
        }).select(USER_SAFE_DATA).skip(skip).limit(limit);

        res.send(users); 
    } catch(err){
        res.status(400).json({ message: err.message});
    }
});

module.exports = userRouter;