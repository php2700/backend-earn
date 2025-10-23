import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        required: false,
        default: 'user',
        enum: ['user']
    },
    registerBy: {
        type: String,
        required: true,
        enum: ['google', 'number']
    },
    referralCode:
    {
        type: String,
        required: false
    },
    isActivate: {
        type: Boolean,
        default: false,
    },
    walletAmount: {
        type: Number,
        default: 100
    },
    totalAmount: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
})

const userModel = mongoose.model('user', userSchema)
export default userModel;



