const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth");
const {validateEditProfileData} =require("../utils/validation");
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req,res) => {
    try{
        const user = req.user;
        res.send(user);
    } catch(err){
        res.status(400).send("ERROR : "+ err.message);
    }
});

profileRouter.patch("/profile/edit", userAuth, async (req,res) => {
    try{
        if(!validateEditProfileData(req)){
            throw new Error("Invalid Edit Request");
        };
        const loggedInUser = req.user; 

        Object.keys(req.body).forEach((key) => 
            (loggedInUser[key] = req.body[key])
        );
        await loggedInUser.save();
        res.json({
            message : `${loggedInUser.firstName}, your profile is updated successfully`,
            data: loggedInUser
        });
    } catch(err){   
        res.status(400).send("ERROR : "+ err.message);
    }
});

profileRouter.patch("/profile/password", userAuth, async (req,res) => {
    try{
        const {oldPassword, newPassword} = req.body;
        const user = req.user;

        const isValid = await user.validatePassword(oldPassword);
        if(!isValid){
            throw new Error("Old password is incorrect");
        }
        const newHashedPassword = await bcrypt.hash(newPassword, 10); 
        user.password = newHashedPassword;
        await user.save();
        res.send(`${user.firstName}'s password updated successfully`);
    } catch(err){
        res.status(400).send("ERROR : "+ err.message);
    }
});

module.exports = profileRouter;