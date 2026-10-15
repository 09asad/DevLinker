const validator = require("validator");

const validateSignUpData = (req) => {
    const { firstName, emailId, password } = req.body;

    if(validator.isEmpty(firstName)){
        throw new Error("First Name is compulsory");
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("Email is invalid");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Enter a strong password");
    }
};

const validateEditProfileData = (req) => {
    const allowedEditFields = [
        "firstName","lastName","emailId","photoURL","gender","age","about","skills",
    ];

    const isEditAllowed = Object.keys(req.body).every((k) => 
        allowedEditFields.includes(k)
    );
    return isEditAllowed;
};

module.exports = {
    validateSignUpData,
    validateEditProfileData,
};