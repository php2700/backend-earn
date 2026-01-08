import { Schema, model } from 'mongoose';

const withdrawalSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true }, // Level ka full amount (e.g. 50, 100)
    processingFee: { type: Number, required: true }, // User ne kitni fee pay ki (e.g. 25, 50)
    level: { type: Number, required: true }, // Kaunse level par request ki gayi
    bankAccount: { type: String, required: true },
    ifscCode: { type: String, required: true },
    utrNumber: { type: String, required: true },
    paymentImage: { type: String }, // Screenshot path
    // status: { 
    //     type: String, 
    //     enum: ['pending', 'approved', 'rejected'], 
    //     default: 'pending' 
    // }
    status: { 
        type: String, 
        // Yahan 'completed' add kar dijiye
        enum: ['pending', 'approved', 'rejected', 'completed'], 
        default: 'pending' 
    }
}, { timestamps: true });

export default model('Withdrawal', withdrawalSchema);