import mongoose from 'mongoose';
import userModel from "../Models/userModel.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import ContactModel from "../Models/contactModel.js";
import ReferModel from "../Models/referModel.js";
import WithdrawModel from '../Models/withdrawModel.js';


export const getUserData = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await userModel.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(id) }
            },
            {
                $lookup: {
                    from: "refers",
                    localField: "_id",
                    foreignField: "referById",
                    as: "referredUsers"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "referredUsers.referTo",
                    foreignField: "_id",
                    as: "referredUsersDetails"
                }
            },
            {
                $addFields: {
                    activeReferralsCount: {
                        $size: {
                            $filter: {
                                input: "$referredUsersDetails",
                                cond: { $eq: ["$$this.isActivate", true] }
                            }
                        }
                    },
                    inactiveReferralsCount: {
                        $size: {
                            $filter: {
                                input: "$referredUsersDetails",
                                cond: { $eq: ["$$this.isActivate", false] }
                            }
                        }
                    }
                }
            }
        ]);

        if (!result || result?.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const userData = {
            ...result[0],
            activeReferralsCount: result[0].activeReferralsCount,
            inactiveReferralsCount: result[0].inactiveReferralsCount
        };

        res.status(200).json(userData);
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

export const paymentProof = async (req, res, next) => {
    try {
        const { userId, utrNumber } = req.body;
        const file = req.file;

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!utrNumber && !file) {
            return res.status(400).json({
                message: "Please provide either UTR number or payment image.",
            });
        }

        const updateData = {};
        if (utrNumber) updateData.utrNumber = utrNumber;
        if (file) {
            updateData.paymentImage = `public/uploads/${file.filename}`;
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        );

        res.status(200).json({
            message: "Payment proof added successfully",
            user: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};


export const activateReferCode = async (req, res, next) => {
    try {
        const { userId, isActivate } = req?.body;

        if (!userId) {
            return res.status(400).json({ message: "Missing parameters" });
        }
        const userData = await userModel.findOne({ _id: userId })
        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }
        function generateReferralCode(length = 8) {
            return crypto.randomBytes(length).toString("hex").slice(0, length).toUpperCase();
        }
        userData.isActivate = isActivate;
        userData.walletAmount = 100;
        const referralCode = generateReferralCode();
        userData.referralCode = referralCode;
        await userData.save();

        const refferdUser = await ReferModel.findOne({ referTo: userId });
        if (refferdUser) {
            const refferdUserData = await userModel.findOne({ _id: refferdUser?.referById });
            const referAmount = Number(process.env.REFER_AMOUNT) || 200;
            refferdUserData.walletAmount = (refferdUserData.walletAmount || 0) + referAmount;
            await refferdUserData.save();
        }
        return res.status(201).json({ message: "activate successfully!" });
    } catch (error) {
        console.log("upadate error", error);
        next(error)
    }
}

export const edit = async (req, res, next) => {
    const { userId, name } = req.body;
    try {
        const user = await userModel.findByIdAndUpdate(
            userId,
            { name },
            { new: true }
        );
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        next(error)
    }
}


export const withdrawAmount = async (req, res, next) => {
    try {
        const { userId, amount, upiId } = req.body;

        if (!userId || !amount || !upiId)
            return res.status(400).json({ message: "Missing required fields" });

        const user = await userModel.findOne({ _id: userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.walletAmount < amount)
            return res.status(400).json({ message: "Insufficient balance" });

        const withdraw = await new WithdrawModel({ userId, amount, upiId });
        await withdraw.save();
        res.status(200).json({
            message: "Withdraw request sent to admin for approval",
            withdraw,
        });
    } catch (error) {
        next(error)
    }
}

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

export const paymentConfig = async (req, res, next) => {
    try {
         res.json({
            amount: process.env.APP_AMOUNT,
            currency: process.env.APP_CURRENCY,
            name: process.env.APP_NAME,
            upiId: process.env.APP_UPI_ID,
        });
    } catch (error) {
        next(error)
    }
}