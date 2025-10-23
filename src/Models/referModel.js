import mongoose from "mongoose";
// import { ref } from "process";

const referSchema = new mongoose.Schema(
    {
        referById: {
            type: mongoose.Types.ObjectId,
            ref:"user",
            required: true
        },
        referTo: {
            type: mongoose.Types.ObjectId,
            ref:"user",
            required: true
        }
    },
    { timestamps: true }
);

const ReferModel = mongoose.model("refer", referSchema);
export default ReferModel

