const mongoose = require("mongoose");
const User = require("./user");

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    paymentId: {
        type: String,
    },
    orderId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    notes: {
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },  
        membershipType: {
            type: String,
        },
    },
},{
    timestamps: true,
});

module.exports = mongoose.model("Payment", paymentSchema);