import mongoose from "mongoose";

const referAmountSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const referAmountModel= mongoose.model("ReferAmount", referAmountSchema);
export default  referAmountModel

