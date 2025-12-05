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
        bankAccountName: {
            type: String,
            required: function () {
                return this.isNew;
            }
        },
        ifscCode: {
            type: String,
            required: function () {
                return this.isNew;
            }
        }
    },
    { timestamps: true }
);

const WithdrawModel = mongoose.model("withdraw", withdrawReqSchema);
export default WithdrawModel

