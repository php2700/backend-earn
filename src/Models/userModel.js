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
    // isActivate: {
    //     type: Boolean,
    //     default: false,
    // },
   isActivate: {
    type: String,
    default: 'inactive',
    enum: ['inactive', 'active', 'reject']
},
    walletAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    upiId: {
        type: String,
        required: false
    },
    utrNumber: { type: String, required: false },
    paymentImage: { type: String, required: false },
    pointsBalance: { type: Number, default: 1000 }, // Signup पर 1000 पॉइंट्स (₹10)
    lastScratchAt: { type: Date },                 // आखिरी स्क्रैच का समय
    // isActivate: { type: Boolean, default: false },
    scratchCardsBalance: { type: Number, default: 0 }, // Ye naya field hai (Referral ke liye)
    lastScratchDate: { type: Date },

}, {
    timestamps: true
})

const userModel = mongoose.model('user', userSchema)
export default userModel;



