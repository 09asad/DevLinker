const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
    {
        fromUserId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",                              // reference to the user collection
            required: true,
        },
        toUserId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status : {
            type: String,
            enum: {
                values: ["ignored","interested","accepted","rejected"],
                message: `{VALUE} is incorrect status type`,
            },
        },
    },
    {
        timestamps: true,
    }
);

connectionRequestSchema.index(
    { fromUserId:1 , toUserId:1 },
    { unique: true }
);

connectionRequestSchema.pre("save", function(){
    const connectionRequest = this;
    // Check if fromUserId is same as toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("Can't send connection request to yourself!!!");
    }
});

const connectionRequestModel = mongoose.model("ConnectionRequest", connectionRequestSchema);       // connectionrequests will be the name of the collection in database

module.exports = connectionRequestModel;