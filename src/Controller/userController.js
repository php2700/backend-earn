import mongoose from 'mongoose';
import userModel from "../Models/userModel.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import ContactModel from "../Models/contactModel.js";
import ReferModel from "../Models/referModel.js";

export const getUserData = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await userModel.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const LoginWithGoogle = async (req, res) => {
    try {
        const { accessToken } = req.body;
        const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userData = await googleRes.json();
        if (!userData || !userData.email) {
            return res.status(400).json({ message: "Invalid Google token" });
        }
        let user = await userModel.findOne({ email: userData.email });

        let isAlreadyCreated = true;
        if (!user) {
            user = await userModel.create({
                name: userData.name,
                email: userData.email,
                registerBy: "google",
                referralCode: ""
            });
            isAlreadyCreated = false
        }
        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRE_TIME }
        );

        res.json({ token, user, isAlreadyCreated });
    } catch (error) {
        return res
            .status(400)
            .json({ success: false, message: error?.message });
    }
};

export const refferBy = async (req, res, next) => {
    try {
        const { _id, referredBy } = req?.body;
        let user = await userModel.findOne({ referralCode: referredBy });
        if (!user) return res.status(400).json({ success: false, message: 'refer code not exist' })
        let obj = { referById: user?._id, referTo: _id }
        const refer = new ReferModel(obj);
        await refer.save();
        return res.status(201).json({ message: "referr by update successfully!" });
    } catch (error) {
        console.log("upadate error", error);
        next(error);
    }
}

export const getReferralsByCode = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }
        const referrals = await ReferModel.aggregate([
            { $match: { referById: new mongoose.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: "users",
                    localField: "referTo",
                    foreignField: "_id",
                    as: "referredUser"
                }
            },
            { $unwind: "$referredUser" },
            {
                $project: {
                    _id: 0,
                    name: "$referredUser.name",
                    email: "$referredUser.email",
                    referralCode: "$referredUser.referralCode",
                    createdAt: "$referredUser.createdAt"
                }
            }
        ]);
        res.status(200).json({
            userReferralCode: userData.referralCode,
            success: true,
            count: referrals.length,
            referrals
        });
    } catch (error) {
        console.error("Error fetching referrals:", error);
        next(error);
    }
};




// export const updatePayment = async (req, res) => {
//     try {
//         const { userId, loanApplicationId } = req.body;
//         const file = req.file;

//         if (!file) {
//             return res.status(400).json({ message: "No image uploaded" });
//         }

//         const isRefferCodeExist = await userModel.findOne({ _id: userId })
//         function generateReferralCode(length = 8) {
//             return crypto.randomBytes(length).toString("hex").slice(0, length).toUpperCase();
//         }

//         if (isRefferCodeExist && !isRefferCodeExist.referralCode) {
//             const referralCode = generateReferralCode();
//             isRefferCodeExist.referralCode = referralCode;
//             isRefferCodeExist.isAppliedLoan = true;
//             await isRefferCodeExist.save();
//         }

//         const updatedLoan = await loanApplyModel.findByIdAndUpdate(
//             loanApplicationId,
//             { paymentImg: `public/uploads/${req.file.filename}` },
//             { new: true }
//         );

//         if (!updatedLoan) {
//             return res.status(404).json({ message: "Loan application not found" });
//         }

//         res.status(200).json({
//             message: "Payment proof uploaded successfully!",
//             data: updatedLoan,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };


export const addContact = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const newMessage = await ContactModel.create({ name, email, subject, message });
        res.status(201).json({ success: true, data: newMessage });
    } catch (err) {
        next(err);
    }
};