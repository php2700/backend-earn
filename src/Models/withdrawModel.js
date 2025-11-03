import mongoose from "mongoose";

const withdrawReqSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "user",
        },
        amount: {
            type: Number,
            required: true,
        },
        isAccept: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        },
        upiId:{
             type: String,
             required: true,
        }
    },
    { timestamps: true }
);

const WithdrawModel = mongoose.model("withdraw", withdrawReqSchema);
export default WithdrawModel

