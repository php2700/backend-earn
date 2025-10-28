import mongoose from "mongoose";

const paymentReqSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        isAccept: {
            type: String,
            enum: ['Pending', 'Accepted'],
            default: 'Pending'
        }
    },
    { timestamps: true }
);

const PaymentReqModel = mongoose.model("paymentReq", paymentReqSchema);
export default PaymentReqModel

