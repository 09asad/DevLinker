const express = require("express");
const authRouter = express.Router();
const {validateSignUpData} = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


authRouter.post("/signup", async (req,res) => {
    try{
        // Validation of data
        validateSignUpData(req);

        const {firstName, lastName, emailId, password, skills, about} = req.body;

        // Encrypt the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creating a new instance of the User model
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: hashedPassword,
            skills,
            about,
        });
        const savedUser = await user.save();    
        const token = await savedUser.getJWT();
        
        res.cookie("token",token, {
            expires: new Date(Date.now() + 3 * 3600000)
        });

        res.json({message: "User added successfully!", data: savedUser});
        
    } catch(err){
        res.status(400).send("Error: "+ err.message);
    }
});

authRouter.post("/login", async (req,res) => {
    try{
        const {emailId, password} = req.body;

        const user = await User.findOne({emailId: emailId});
        if(!user){ 
            throw new Error("Invalid credentials");
        }
        const isPasswordValid = await user.validatePassword(password);

        if(isPasswordValid){
            const token = await user.getJWT();

            // Add the token to cookie and sends the response back to the user
            res.cookie("token", token, {
                expires: new Date(Date.now() + 3 * 3600000),    // cookie will be removed after 3 hours
                httpOnly: true,                                 // cookies only accessible by web browser(HTTP)
            });
            res.send(user);
        } else{
            throw new Error("Password is incorrect");
        }
    } catch(err){
        res.status(400).send("ERROR : "+ err.message);
    }
});

authRouter.post("/logout", async (req,res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });
    res.send("Logout succesfull!");
});

module.exports = authRouter;