import mongoose from 'mongoose';
import userModel from "../Models/userModel.js";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import ContactModel from "../Models/contactModel.js";
import ReferModel from "../Models/referModel.js";
import WithdrawModel from '../Models/withdrawModel.js';
import { Status } from '../variable/variable.js';
import  Withdrawal from "../Models/Withdrawal.js";


const getPointsByDay = (day) => {
    const pointsChart = {
        1: 800, 2: 800, 3: 700, 4: 700, 5: 600, 6: 400, 7: 400, 8: 350, 9: 350, 10: 300,
        11: 200, 12: 0, 13: 200, 14: 0, 15: 150, 16: 0, 17: 150, 18: 0, 19: 100, 20: 0,
        21: 100, 22: 100, 23: 100, 24: 100, 25: 100, 26: 100, 27: 100, 28: 100, 29: 200,
        30: 2800
    };
    return pointsChart[day];
};



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


// export const LoginWithGoogle = async (req, res) => {
//     try {
//         const { accessToken } = req.body;
//         const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`,
//             },
//         });

//         const userData = await googleRes.json();
//         if (!userData || !userData.email) {
//             return res.status(400).json({ message: "Invalid Google token" });
//         }
//         let user = await userModel.findOne({ email: userData.email });

//         let isAlreadyCreated = true;
//         if (!user) {
//             user = await userModel.create({
//                 name: userData.name,
//                 email: userData.email,
//                 registerBy: "google",
//                 referralCode: "",
//                 pointsBalance: 0,
//                 walletAmount: 0
//             });
//             isAlreadyCreated = false
//         }
//         const token = jwt.sign(
//             { _id: user._id, role: user.role },
//             process.env.JWT_SECRET_KEY,
//             { expiresIn: process.env.JWT_EXPIRE_TIME }
//         );

//         res.json({ token, user, isAlreadyCreated });
//     } catch (error) {
//         return res
//             .status(400)
//             .json({ success: false, message: error?.message });
//     }
// };



// export const LoginWithGoogle = async (req, res) => {
//     try {
//         const { accessToken } = req.body;
//         const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`,
//             },
//         });

//         const userData = await googleRes.json();
//         if (!userData || !userData.email) {
//             return res.status(400).json({ message: "Invalid Google token" });
//         }

//         let user = await userModel.findOne({ email: userData.email });

//         let isAlreadyCreated = true;

//         if (!user) {
//             // --- NAYA USER SIGNUP LOGIC ---
            
//             // 1. Random Referral Code Generator (8 digits)
//             const generateCode = Math.random().toString(36).substring(2, 10).toUpperCase();

//             user = await userModel.create({
//                 name: userData.name,
//                 email: userData.email,
//                 registerBy: "google",
//                 referralCode: generateCode, // Turant code set hoga
//                 pointsBalance: 1000,        // Turant 1000 points milenge
//                 isActivate: 'active',       // Turant active status
//                 walletAmount: 0,
//                 withdrawalStage: 1
//             });
//             isAlreadyCreated = false;
//         } else {
//             // --- EXISTING USER FIX ---
//             // Agar purana user login kare jiska referral code khali hai ya status inactive hai
//             if (!user.referralCode || user.referralCode === "" || user.isActivate === 'inactive') {
//                 user.referralCode = user.referralCode || Math.random().toString(36).substring(2, 10).toUpperCase();
//                 user.isActivate = 'active';
//                 // Agar points pehle se 1000 se kam hain toh update karein (Optional)
//                 if(user.pointsBalance < 1000) user.pointsBalance = 1000;
//                 await user.save();
//             }
//         }

//         const token = jwt.sign(
//             { _id: user._id, role: user.role },
//             process.env.JWT_SECRET_KEY,
//             { expiresIn: process.env.JWT_EXPIRE_TIME }
//         );

//         res.json({ token, user, isAlreadyCreated });
//     } catch (error) {
//         return res
//             .status(400)
//             .json({ success: false, message: error?.message });
//     }
// };

// 1. Google Login Controller
// export const LoginWithGoogle = async (req, res) => {
//     try {
//         const { accessToken } = req.body;
//         const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
//             headers: { Authorization: `Bearer ${accessToken}` },
//         });

//         const userData = await googleRes.json();
//         if (!userData?.email) return res.status(400).json({ message: "Invalid Google token" });

//         let user = await userModel.findOne({ email: userData.email });

//         let isAlreadyCreated = true;
//         if (!user) {
//             // Naye user ke liye unique code generate karein
//             const generateCode = Math.random().toString(36).substring(2, 10).toUpperCase();

//             user = await userModel.create({
//                 name: userData.name,
//                 email: userData.email,
//                 registerBy: "google",
//                 referralCode: generateCode, // Turant code set hoga
//                 pointsBalance: 1000,        // Signup par turant 1000 points
//                 isActivate: 'active',       // Turant active (No admin needed)
//                 walletAmount: 0,
//                 withdrawalStage: 1
//             });
//             isAlreadyCreated = false;
//         }

//         const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET_KEY);
//         res.json({ token, user, isAlreadyCreated });
//     } catch (error) {
//         res.status(400).json({ success: false, message: error.message });
//     }
// };

// 1. Google Login: Naye user ko 1000 points aur Referral Code turant dene ke liye
// export const LoginWithGoogle = async (req, res) => {
//     try {
//         const { accessToken } = req.body;
//         const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
//             headers: { Authorization: `Bearer ${accessToken}` },
//         });

//         const userData = await googleRes.json();
//         if (!userData || !userData.email) {
//             return res.status(400).json({ message: "Invalid Google token" });
//         }

//         let user = await userModel.findOne({ email: userData.email });

//         let isAlreadyCreated = true;
//         if (!user) {
//             // Naya Referral Code generate karein (e.g. TOTO78AB)
//             const generateCode = Math.random().toString(36).substring(2, 10).toUpperCase();

//             // --- NAYA USER CREATE KARTE WAQT HI SARI VALUES DE DENI HAI ---
//             user = await userModel.create({
//                 name: userData.name,
//                 email: userData.email,
//                 registerBy: "google",
//                 referralCode: generateCode, // Turant code set hoga
//                 pointsBalance: 1000,        // Signup par turant 1000 points (Admin ka wait nahi)
//                 isActivate: 'active',       // Account turant active
//                 walletAmount: 0,
//                 withdrawalStage: 1
//             });
//             isAlreadyCreated = false;
//         } else {
//             // FIX: Agar purana user login kare jiska code khali hai, toh usey ab update kar dein
//             if (!user.referralCode || user.referralCode === "") {
//                 user.referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
//                 user.isActivate = 'active';
//                 if(user.pointsBalance < 1000) user.pointsBalance = 1000;
//                 await user.save();
//             }
//         }

//         const token = jwt.sign(
//             { _id: user._id, role: user.role },
//             process.env.JWT_SECRET_KEY,
//             { expiresIn: process.env.JWT_EXPIRE_TIME }
//         );

//         // Naya user ho ya purana, backend pura 'user' object bheje ga frontend ko
//         res.json({ token, user, isAlreadyCreated });
//     } catch (error) {
//         return res.status(400).json({ success: false, message: error?.message });
//     }
// };



export const LoginWithGoogle = async (req, res) => {
    try {
        const { accessToken } = req.body;
        const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const userData = await googleRes.json();
        if (!userData || !userData.email) return res.status(400).json({ message: "Invalid Google token" });

        let user = await userModel.findOne({ email: userData.email });
        let isAlreadyCreated = true;

        if (!user) {
            // Naya code generate karein
            const generateCode = Math.random().toString(36).substring(2, 10).toUpperCase();

            user = await userModel.create({
                name: userData.name,
                email: userData.email,
                registerBy: "google",
                referralCode: generateCode,
                pointsBalance: 1000,    // Turant 1000 points
                isActivate: 'active',   // Turant active
                walletAmount: 0,
                withdrawalStage: 1
            });
            isAlreadyCreated = false;
        }

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET_KEY);
        res.json({ token, user, isAlreadyCreated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// 2. Update Referral: Jaise hi naya user submit kare, Referrer ko turant scratch card mile
export const updateRefferBy = async (req, res) => {
    try {
        const { _id, referredBy } = req.body; // _id: naya user, referredBy: referral code

        if (!referredBy) return res.status(400).json({ message: "Referral code required" });

        const newUser = await userModel.findById(_id);
        if (!newUser) return res.status(404).json({ message: "User not found" });

        // 1. Referrer (jisne refer kiya) ko dhoondo
        const cleanCode = referredBy.trim().toUpperCase();
        const referrer = await userModel.findOne({ referralCode: cleanCode });

        if (!referrer) {
            return res.status(404).json({ message: "Invalid Referral Code" });
        }

        // 2. Self-referral check (khud ka code use nahi kar sakte)
        if (referrer._id.toString() === newUser._id.toString()) {
            return res.status(400).json({ message: "Self-referral not allowed" });
        }

        // --- REWARD LOGIC (IMPORTANT) ---
        // 3. Referrer ko turant 1 scratch card balance de do
        referrer.scratchCardsBalance = (referrer.scratchCardsBalance || 0) + 1;
        await referrer.save();

        // 4. Naye User ko 'active' mark karein (kyunki ab activation free hai)
        newUser.isActivate = 'active'; 
        // Agar naye user ke points 0 hain, toh signup bonus (1000) yahan bhi ensure kar sakte hain
        if (newUser.pointsBalance === 0) {
            newUser.pointsBalance = 1000;
        }
        await newUser.save();

        res.json({ 
            success: true, 
            message: "Referral successful! Referrer rewarded with a scratch card." 
        });

    } catch (error) {
        console.error("Referral Error:", error);
        res.status(500).json({ message: error.message });
    }
};


// 2. Update ReferredBy Controller (Yahan Referrer ko 20k reward milega)
// export const updateRefferBy = async (req, res) => {
//     try {
//         const { _id, referredBy } = req.body; // _id is new user, referredBy is code

//         const user = await userModel.findById(_id);
//         if (!user) return res.status(404).json({ message: "User not found" });

//         // Jisne refer kiya usko dhoondo
//         const referrer = await userModel.findOne({ referralCode: referredBy });

//         if (referrer) {
//             // PEHLE: Admin activation par reward milta tha
//             // AB: Naye user ke signup par hi Referrer ko reward mil jayega
//             referrer.scratchCardsBalance += 1; // 20,000 points ka scratch card mil gaya
//             await referrer.save();

//             // Tracking ke liye referred list mein entry (Optional - agar aapka model hai)
//             // await referredModel.create({ referById: referrer._id, referTo: user._id });
//         }

//         res.json({ success: true, message: "Referral updated and reward sent to referrer!" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };


export const getTodayRewardPreview = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userModel.findById(userId);

        const now = new Date();
        const signupDate = new Date(user.createdAt);
        const diffInTime = now.getTime() - signupDate.getTime();
        const dayNumber = Math.floor(diffInTime / (1000 * 3600 * 24)) + 1;



        const pointsToWin = getPointsByDay(dayNumber);
        res.status(200).json({ points: pointsToWin });

    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};






// export const claimReferralCoupon = async (req, res) => { 
//     const { userId } = req.body;
//     const user = await userModel.findById(userId);

//     if (user.scratchCardsBalance > 0) {
//         user.pointsBalance += 20000; // Referral Bonus Points
//         user.scratchCardsBalance -= 1; // Ek card use ho gaya
//         await user.save();
//         return res.status(200).json({ message: "20,000 Referral points added!" });
//     }
//     return res.status(400).json({ message: "No extra coupons available" });
// };


// controllers/userController.js

// export const claimReferralCoupon = async (req, res) => {
//     try {
//         const { userId } = req.body;

//         // Validation
//         if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({ message: "Invalid User ID" });
//         }

//         const user = await userModel.findById(userId);
//         if (!user) return res.status(404).json({ message: "User not found" });

//         // Step 1: Check karo ki kya koi Referral Coupon pending hai
//         if (user.scratchCardsBalance <= 0) {
//             return res.status(400).json({ message: "No referral coupons available" });
//         }

//         // Step 2: Fix 20,000 points add karo
//         const bonusPoints = 20000;
//         user.pointsBalance = (user.pointsBalance || 0) + bonusPoints;

//         // Step 3: Ek coupon balance minus karo
//         user.scratchCardsBalance -= 1;

//         await user.save();

//         // Step 4: Success Response
//         return res.status(200).json({
//             message: "Success",
//             points: bonusPoints,
//             newBalance: user.pointsBalance,
//             remainingCoupons: user.scratchCardsBalance
//         });

//     } catch (error) {
//         console.error("Referral Claim Error:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };




// export const refferBy = async (req, res, next) => {
//     try {
//         const { _id, referredBy } = req?.body;
//         let user = await userModel.findOne({ referralCode: referredBy });
//         if (!user) return res.status(400).json({ success: false, message: 'refer code not exist' })
//         let obj = { referById: user?._id, referTo: _id }
//         const refer = new ReferModel(obj);
//         await refer.save();
//         return res.status(201).json({ message: "referr by update successfully!" });
//     } catch (error) {
//         console.log("upadate error", error);
//         next(error);
//     }
// }

export const refferBy = async (req, res, next) => {
    try {
        const { _id, referredBy } = req?.body; // _id: naya user, referredBy: code

        // 1. Referrer ko dhoondo
        let referrer = await userModel.findOne({ referralCode: referredBy });
        if (!referrer) return res.status(400).json({ success: false, message: 'Refer code does not exist' });

        // 2. Self-referral check
        const newUser = await userModel.findById(_id);
        if (referrer._id.toString() === _id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot refer yourself' });
        }

        // 3. ReferModel mein record save karein (Tracking ke liye)
        let obj = { referById: referrer._id, referTo: _id }
        const refer = new ReferModel(obj);
        await refer.save();

        // --- IMPORTANT: REWARD LOGIC ADDED HERE ---
        
        // 4. Referrer ko turant 1 Scratch Card de do
        referrer.scratchCardsBalance = (referrer.scratchCardsBalance || 0) + 1;
        await referrer.save();

        // 5. Naye User ko turant Active aur 1000 points de do
        if (newUser) {
            newUser.isActivate = 'active';
            newUser.pointsBalance = 1000; // Signup bonus
            await newUser.save();
        }

        return res.status(201).json({ 
            success: true, 
            message: "Referral updated! Referrer rewarded and User activated." 
        });
    } catch (error) {
        console.log("update error", error);
        next(error);
    }
}

// export const getReferralsByCode = async (req, res, next) => {
//     try {
//         const { userId } = req.params;
//         const userData = await userModel.findById(userId);
//         if (!userData) {
//             return res.status(404).json({ message: "User not found" });
//         }
//         const referrals = await ReferModel.aggregate([
//             { $match: { referById: new mongoose.Types.ObjectId(userId) } },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "referTo",
//                     foreignField: "_id",
//                     as: "referredUser"
//                 }
//             },
//             { $unwind: "$referredUser" },
//             {
//                 $project: {
//                     _id: 0,
//                     name: "$referredUser.name",
//                     email: "$referredUser.email",
//                     referralCode: "$referredUser.referralCode",
//                     createdAt: "$referredUser.createdAt"
//                 }
//             }
//         ]);
//         res.status(200).json({
//             userReferralCode: userData.referralCode,
//             success: true,
//             count: referrals.length,
//             referrals
//         });
//     } catch (error) {
//         console.error("Error fetching referrals:", error);
//         next(error);
//     }
// };


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
                    from: "users", // Check karein collection name 'users' hi hai na
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
                    isActivate: "$referredUser.isActivate", // YEH LINE ADD KI HAI
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


// export const activateReferCode = async (req, res, next) => {
//     try {
//         const { userId, isActivate } = req?.body;

//         if (!userId) {
//             return res.status(400).json({ message: "Missing parameters" });
//         }
//         const userData = await userModel.findOne({ _id: userId })
//         if (!userData) {
//             return res.status(404).json({ message: "User not found" });
//         }
//         function generateReferralCode(length = 8) {
//             return crypto.randomBytes(length).toString("hex").slice(0, length).toUpperCase();
//         }
//         userData.isActivate = isActivate;
//         userData.walletAmount = 100;
//         const referralCode = generateReferralCode();
//         userData.referralCode = referralCode;
//         await userData.save();

//         const refferdUser = await ReferModel.findOne({ referTo: userId });
//         if (refferdUser) {
//             const refferdUserData = await userModel.findOne({ _id: refferdUser?.referById });
//             const referAmount = Number(process.env.REFER_AMOUNT) || 200;
//             refferdUserData.walletAmount = (refferdUserData.walletAmount || 0) + referAmount;
//             await refferdUserData.save();
//         }
//         return res.status(201).json({ message: "activate successfully!" });
//     } catch (error) {
//         console.log("upadate error", error);
//         next(error)
//     }
// }



// yeh sahi hai 
// export const activateReferCode = async (req, res, next) => {
//     try {
//         const { userId, isActivate } = req?.body;

//         if (!userId) {
//             return res.status(400).json({ message: "Missing parameters" });
//         }

//         const userData = await userModel.findOne({ _id: userId })
//         if (!userData) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         function generateReferralCode(length = 8) {
//             return crypto.randomBytes(length).toString("hex").slice(0, length).toUpperCase();
//         }

//         userData.isActivate = isActivate;

//         // --- बदलाव 1: साइनअप बोनस (₹100 की जगह 1000 Points) ---
//         // पुराने ₹100 को हटाकर पॉइंट्स बैलेंस में 1000 ऐड कर रहे हैं
//         userData.pointsBalance = (userData.pointsBalance || 0) + 1000; 
//         userData.walletAmount = 0; // रियल मनी वॉलेट को अभी 0 रखें

//         const referralCode = generateReferralCode();
//         userData.referralCode = referralCode;
//         await userData.save();

//         // --- बदलाव 2: रेफरल बोनस (₹200 की जगह 20,000 Points) ---
//         const refferdUser = await ReferModel.findOne({ referTo: userId });
//         if (refferdUser) {
//             const refferdUserData = await userModel.findOne({ _id: refferdUser?.referById });

//             // पुराने process.env.REFER_AMOUNT (₹200) को हटाकर 20,000 पॉइंट्स दे रहे हैं
//             const referPoints = 20000; 

//             refferdUserData.pointsBalance = (refferdUserData.pointsBalance || 0) + referPoints;
//             refferdUserData.activeReferralsCount = (refferdUserData.activeReferralsCount || 0) + 1;

//             await refferdUserData.save();
//         }

//         return res.status(201).json({ message: "Account activated with 1000 points & Referrer rewarded with 20,000 points!" });
//     } catch (error) {
//         console.log("update error", error);
//         next(error)
//     }
// }


export const activateReferCode = async (req, res, next) => {
    try {
        const { userId, isActivate } = req?.body;
        const userData = await userModel.findOne({ _id: userId });
        if (!userData) return res.status(404).json({ message: "User not found" });

        function generateReferralCode(length = 8) {
            return crypto.randomBytes(length).toString("hex").slice(0, length).toUpperCase();
        }
        if (isActivate == 'inactive' || isActivate == 'reject') {
            userData.isActivate = isActivate;
            await userData.save();
            return res.status(201).json({ message: "status updated " });
        }
        userData.isActivate = isActivate;

        userData.pointsBalance = (userData.pointsBalance || 0) + 1000; // New user bonus
        await userData.save();
        const referralCode = generateReferralCode();
        userData.referralCode = referralCode;
        await userData.save();

        const refferdUser = await ReferModel.findOne({ referTo: userId });
        if (refferdUser) {
            const refferdUserData = await userModel.findOne({ _id: refferdUser?.referById });

            // --- CHANGE HERE: Points ki jagah Scratch Card Balance badhao ---
            refferdUserData.scratchCardsBalance = (refferdUserData.scratchCardsBalance || 0) + 1;
            refferdUserData.activeReferralsCount = (refferdUserData.activeReferralsCount || 0) + 1;

            await refferdUserData.save();
        }

        return res.status(201).json({ message: "Activated! Referrer rewarded with a Scratch Card." });
    } catch (error) { next(error); }
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
        const { userId, amount, bankAccountName, ifscCode } = req.body;
        console.log(req?.body, 'hh')
        if (!userId || !amount || !bankAccountName || !ifscCode)
            return res.status(400).json({ message: "Missing required fields" });

        const user = await userModel.findOne({ _id: userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.walletAmount < amount)
            return res.status(400).json({ message: "Insufficient balance" });

        const withdraw = await new WithdrawModel({ userId, amount, bankAccountName, ifscCode });
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
            imageName: process.env.PAYMENT_IMAGE,
            accountHolder: process.env.ACCOUNT_HOLDER_NAME
        });
    } catch (error) {
        next(error)
    }
}




// export const claimDailyPoints = async (req, res) => {
//     try {
//         const { userId } = req.body;
//         const user = await userModel.findById(userId);

//         if (!user) return res.status(404).json({ message: "User not found" });

//         const now = new Date();
//         const signupDate = new Date(user.createdAt);

//         // 1. दिन कैलकुलेट करें (Day 1 to 30)
//         const diffInTime = now.getTime() - signupDate.getTime();
//         const currentDayNumber = Math.floor(diffInTime / (1000 * 3600 * 24)) + 1;

//         if (currentDayNumber > 30) {
//             return res.status(403).json({ message: "Your 30-day reward period has ended." });
//         }

//         // 2. 24 घंटे की लिमिट चेक करें (आज स्क्रैच किया या नहीं)
//         if (user.lastScratchAt) {
//             const lastScratch = new Date(user.lastScratchAt);
//             if (now.toDateString() === lastScratch.toDateString()) {
//                 return res.status(400).json({ message: "You have already claimed today's points." });
//             }
//         }

//         // 3. चार्ट से पॉइंट्स निकालें
//         const earnedPoints = getPointsByDay(currentDayNumber);

//         // 4. यूजर का बैलेंस अपडेट करें
//         user.pointsBalance = (user.pointsBalance || 0) + earnedPoints;
//         user.lastScratchAt = now;
//         await user.save();

//         res.status(200).json({
//             message: earnedPoints === 0 ? "Oops! Today is a Black Day (0 Points)." : "Points claimed!",
//             points: earnedPoints,
//             day: currentDayNumber,
//             newPointsBalance: user.pointsBalance
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message || "Internal server error" });
//     }
// };

export const claimDailyPoints = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);

        const now = new Date();
        const signupDate = new Date(user.createdAt);
        const dayNumber = Math.floor((now - signupDate) / (1000 * 3600 * 24)) + 1;

        // आज के पॉइंट्स निकालें
        const pointsToGive = getPointsByDay(dayNumber);

        // डेटाबेस अपडेट करें (पॉइंट्स बैलेंस में जोड़ें)
        user.pointsBalance = (user.pointsBalance || 0) + pointsToGive;
        user.lastScratchAt = now;
        await user.save();

        res.status(200).json({ message: "Success", points: pointsToGive });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
};

// export const convertPoints = async (req, res) => {
//     try {
//         const { userId } = req.body;
//         const user = await userModel.findById(userId);

//         if (!user) return res.status(404).json({ message: "User not found" });

//         if (user.pointsBalance < 100) {
//             return res.status(400).json({ message: "Minimum 100 points required to claim cash." });
//         }

//         // कैलकुलेशन: 100 Points = 1 Rs
//         const pointsToConvert = user.pointsBalance;
//         const moneyToAdd = Math.floor(pointsToConvert / 100); 
//         const remainingPoints = pointsToConvert % 100; // जो 100 से कम बचेंगे वो पॉइंट्स में ही रहेंगे

//         // वॉलेट और पॉइंट्स अपडेट करें
//         user.walletAmount = (user.walletAmount || 0) + moneyToAdd;
//         user.pointsBalance = remainingPoints;

//         await user.save();

//         res.status(200).json({
//             message: `Successfully claimed ₹${moneyToAdd}!`,
//             convertedAmount: moneyToAdd,
//             newPointsBalance: user.pointsBalance,
//             newWalletBalance: user.walletAmount
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message || "Internal server error" });
//     }
// };

// export const convertPoints = async (req, res) => {
//     try {
//         const { userId } = req.body;
//         const user = await userModel.findById(userId);

//         if (user.pointsBalance < 100) {
//             return res.status(400).json({ message: "Min 100 points required" });
//         }

//         const pts = user.pointsBalance;
//         const moneyToAdd = Math.floor(pts / 100); // 100 pts = ₹1
//         const remainingPts = pts % 100;

//         // पैसे मेन वॉलेट में डालें और पॉइंट्स कम करें
//         user.walletAmount = (user.walletAmount || 0) + moneyToAdd;
//         user.pointsBalance = remainingPts;
//         await user.save();

//         res.status(200).json({ convertedAmount: moneyToAdd });
//     } catch (error) {
//         res.status(500).json({ message: "Error" });
//     }
// };



28/1
// export const convertPoints = async (req, res) => {
//     try {
//         const { userId } = req.body;
//         const user = await userModel.findById(userId);

//         // Yahan Min balance check ko bhi 400 kar dena chahiye kyunki ab ₹1 ke liye 400 pts chahiye
//         if (user.pointsBalance < 400) {
//             return res.status(400).json({ message: "Min 400 points required to get ₹1" });
//         }

//         const pts = user.pointsBalance;

//         // BADLAV YAHAN HAI: 100 ki jagah 400 karein
//         const moneyToAdd = Math.floor(pts / 400); // Ab 400 pts = ₹1 ho gaya
//         const remainingPts = pts % 400; // 400 se divide hone ke baad bache hue points

//         // पैसे मेन वॉलेट में डालें और पॉइंट्स कम करें
//         user.walletAmount = (user.walletAmount || 0) + moneyToAdd;
//         user.pointsBalance = remainingPts;
//         await user.save();

//         res.status(200).json({ convertedAmount: moneyToAdd });
//     } catch (error) {
//         res.status(500).json({ message: "Error" });
//     }
// };



// export const userTransaaction = async (req, res, next) => {
//     try {

//         const { userId } = req?.params;
//         const result = await userModel.aggregate([
//             {
//                 $match: { _id: new mongoose.Types.ObjectId(userId) }
//             },
//             {
//                 $lookup: {
//                     from: "withdraws",
//                     let: { userId: "$_id" },
//                     pipeline: [
//                         {
//                             $match: { $expr: { $eq: ["$userId", "$$userId"] } }
//                         },
//                         {
//                             $sort: { createdAt: -1 }
//                         }
//                     ],
//                     as: "withdraw"
//                 }
//             }
//         ])

//         if (!result?.length) {
//             return res.status(Status.NOT_FOUND).json({
//                 success: false,
//                 message: "User not found"
//             })
//         }
//         return res.status(Status.SUCCESS).json({ success: true, data: result[0] })
//     } catch (error) {
//         next(error);
//     }
// }


export const convertPoints = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // 1. Daily/Signup Points Math (100 pts = ₹1) -> 1000 pts = ₹10
        const dailyPts = user.pointsBalance || 0;
        const dailyCash = Math.floor(dailyPts / 100);
        const remainingDaily = dailyPts % 100;

        // 2. Referral Points Math (400 pts = ₹1) -> 20,000 pts = ₹50
        const refPts = user.referralPointsBalance || 0;
        const refCash = Math.floor(refPts / 400);
        const remainingRef = refPts % 400;

        const totalCashToAdd = dailyCash + refCash;

        if (totalCashToAdd <= 0) {
            return res.status(400).json({ message: "Not enough points to convert to ₹1" });
        }

        // Wallet update karein
        user.walletAmount = (user.walletAmount || 0) + totalCashToAdd;
        
        // Dono balance reset karein aur bache hue (remainder) points wapis daalein
        user.pointsBalance = remainingDaily;
        user.referralPointsBalance = remainingRef;

        await user.save();

        res.status(200).json({ 
            success: true, 
            convertedAmount: totalCashToAdd,
            message: `Success! Received ₹${dailyCash} (Daily) + ₹${refCash} (Referral)` 
        });
    } catch (error) {
        res.status(500).json({ message: "Conversion failed" });
    }
};

// export const claimReferralCoupon = async (req, res) => {
//     try {
//         const { userId } = req.body;
//         const user = await userModel.findById(userId);

//         if (user.scratchCardsBalance <= 0) {
//             return res.status(400).json({ message: "No coupons" });
//         }

//         const bonusPoints = 20000;
//         // BADLAV: Ab ye points referralPointsBalance mein jayenge
//         user.referralPointsBalance = (user.referralPointsBalance || 0) + bonusPoints;
//         user.scratchCardsBalance -= 1;

//         await user.save();
//         res.status(200).json({ message: "Success", points: bonusPoints });
//     } catch (error) {
//         res.status(500).json({ message: "Error" });
//     }
// };





28/1
export const claimReferralCoupon = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check cards balance
        if (user.scratchCardsBalance <= 0) {
            return res.status(400).json({ message: "No referral coupons available" });
        }

        const bonusPoints = 20000;

        // BADLAV: Points ab 'referralPointsBalance' mein jayenge
        // Taki 100:1 aur 400:1 ka math mix na ho
        user.referralPointsBalance = (user.referralPointsBalance || 0) + bonusPoints;
        
        // Scratch card count kam karein
        user.scratchCardsBalance -= 1;

        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "20,000 Referral Points added to your Referral Wallet!",
            points: bonusPoints,
            referralPointsBalance: user.referralPointsBalance 
        });
    } catch (error) {
        console.error("Referral Claim Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


export const userTransaaction = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // User ki sari withdrawals dhoondo aur latest ko sabse upar rakho
        const withdrawals = await Withdrawal.find({ userId }).sort({ createdAt: -1 });

        if (!withdrawals) {
            return res.status(404).json({
                success: false,
                message: "No transactions found"
            });
        }

        // Frontend ki ummeed ke mutabik data bhej rahe hain
        return res.status(200).json({ 
            success: true, 
            data: { withdraw: withdrawals } 
        });

    } catch (error) {
        next(error);
    }
};






export const activateUsers = async (req, res) => {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (!user.isActivate) {
        user.isActivate = true;
        await user.save();

        // Referrer ko dhoondo
        const referRecord = await ReferModel.findOne({ referTo: userId });
        if (referRecord) {
            const referrer = await userModel.findById(referRecord.referById);
            if (referrer) {
                referrer.walletAmount += 200; // Cash Reward
                referrer.scratchCardsBalance += 1; // Extra Scratch Card Reward
                referrer.activeReferralsCount += 1;
                await referrer.save();
            }
        }
    }
    res.status(200).json({ message: "Activated" });
};

// 2. Daily Points Preview (Points dikhane ke liye)
export const getTodayRewardPreviews = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ points: 0 });
        }
        const user = await userModel.findById(userId);
        const signupDate = new Date(user.createdAt);
        const dayNumber = Math.floor((new Date() - signupDate) / (1000 * 3600 * 24)) + 1;

        // Aapka points logic function yahan call karein
        const points = dayNumber <= 30 ? (800 + Math.floor(Math.random() * 200)) : 0;
        res.status(200).json({ points });
    } catch (e) { res.status(500).json({ points: 0 }); }
};

// 3. Claim Referral Coupon (20,000 Points)
export const claimReferralCoupons = async (req, res) => {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    if (user.scratchCardsBalance > 0) {
        user.pointsBalance += 20000;
        user.scratchCardsBalance -= 1;
        await user.save();
        return res.status(200).json({ points: 20000 });
    }
    res.status(400).json({ message: "No coupons" });
};

// 4. Claim Daily Points
export const claimDailyPointss = async (req, res) => {
    const { userId } = req.body;
    const user = await userModel.findById(userId);
    // ... points calculation ...
    user.pointsBalance += points;
    user.lastScratchAt = new Date();
    await user.save();
    res.status(200).json({ points });
};



// const WITHDRAWAL_LEVELS = {
//     1: { amount: 50, fee: 25 },
//     2: { amount: 500, fee: 250 },
//     3: { amount: 2000, fee: 1000 },
//     4: { amount: 5000, fee: 2500 },
//     5: { amount: 10000, fee: 5000 },
//     6: { amount: 20000, fee: 10000 },
//     7: { amount: 50000, fee: 25000 },
//     8: { amount: 100000, fee: 50000 },
//     9:{ amount: 200000, fee: 100000 },
//    10: { amount: 500000, fee: 250000 },
// };

// export const processInstantWithdrawal = async (req, res) => {
//     try {
//         const { userId, utrNumber, bankAccount, ifscCode, currentLevel } = req.body;

//         // 1. User dhoondo
//         const user = await userModel.findById(userId);
//         if (!user) return res.status(404).json({ message: "User not found" });

//         // 2. Level ka data nikaalo
//         const levelInfo = WITHDRAWAL_LEVELS[currentLevel];
//         if (!levelInfo) return res.status(400).json({ message: "Invalid Level" });

//         // 3. Balance Check (Money Wallet mein Level ke barabar paise hone chahiye)
//         if (user.walletAmount < levelInfo.amount) {
//             return res.status(400).json({ message: `Insufficient balance! Level ${currentLevel} requires ₹${levelInfo.amount}` });
//         }

//         // --- INSTANT UPDATE LOGIC (No Admin Approval) ---

//         // 4. Wallet se Amount deduct karein
//         user.walletAmount -= levelInfo.amount;

//         // 5. Withdrawal Stage update karein (Cycle 1-8)
//         let nextStage = (user.withdrawalStage || 1) + 1;
//         if (nextStage > 10) {
//             nextStage = 1; // Cycle reset to 1 after 8
//         }
//         user.withdrawalStage = nextStage;

//         // 6. Total Withdrawn track karein
//         user.totalAmount = (user.totalAmount || 0) + levelInfo.amount;

//         // 7. Transaction record save karein (Status: Completed)
//         const newWithdrawal = new Withdrawal({
//             userId,
//             amount: levelInfo.amount,
//             processingFee: levelInfo.fee,
//             level: currentLevel,
//             bankAccount,
//             ifscCode,
//             utrNumber,
//             paymentImage: req.file ? req.file.path : "No Image",
//              status: 'approved' // Automatic completed
//         });

//         await user.save();
//         await newWithdrawal.save();

//         res.status(200).json({ 
//             message: `Withdrawal Level ${currentLevel} Processed Successfully!`,
//             walletAmount: user.walletAmount,
//             nextStage: user.withdrawalStage
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };





// const WITHDRAWAL_LEVELS = {
//     1: { amount: 50, fee: 25 },
//     2: { amount: 500, fee: 250 },
//     3: { amount: 2000, fee: 1000 },
//     4: { amount: 5000, fee: 2500 },
//     5: { amount: 10000, fee: 5000 },
//     6: { amount: 20000, fee: 10000 },
//     7: { amount: 50000, fee: 25000 },
//     8: { amount: 100000, fee: 50000 },
//     9: { amount: 200000, fee: 100000 },
//     10: { amount: 500000, fee: 250000 }
// };

// 1. User submits request (Status: Pending)
// export const withdrawRequest = async (req, res) => {
//     try {
//         const userId = req.id;
//         const { utrNumber, bankAccount, ifscCode, level } = req.body;

//         const levelData = WITHDRAWAL_LEVELS[level];
//         const user = await userModel.findById(userId);

//         if (user.walletAmount < levelData.amount) {
//             return res.status(400).json({ message: "Insufficient balance" });
//         }

//         const newWithdrawal = new Withdrawal({
//             userId,
//             amount: levelData.amount,
//             processingFee: levelData.fee,
//             level: level,
//             bankAccount,
//             ifscCode,
//             utrNumber,
//             paymentImage: req.file ? req.file.filename : null,
//             status: 'pending' // Admin approval ke liye pending
//         });

//         await newWithdrawal.save();
//         res.status(200).json({ message: "Request submitted successfully" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };








// 10 LEVELS CONFIGURATION
const WITHDRAWAL_LEVELS = {
    1: { amount: 50, fee: 25 },
    2: { amount: 500, fee: 250 },
    3: { amount: 2000, fee: 1000 },
    4: { amount: 5000, fee: 2500 },
    5: { amount: 10000, fee: 5000 },
    6: { amount: 20000, fee: 10000 },
    7: { amount: 50000, fee: 25000 },
    8: { amount: 100000, fee: 50000 },
    9: { amount: 200000, fee: 100000 },
    10: { amount: 500000, fee: 250000 }
};

// --- USER: SUBMIT WITHDRAWAL REQUEST ---
// userController.js mein withdrawRequest function ko aise update karein:
// export const withdrawRequest = async (req, res) => {
//     try {
//         const userId = req.id;
//         // Frontend se 'level' ya 'currentLevel' dono mein se kuch bhi aaye, handle ho jayega
//         const levelKey = req.body.level || req.body.currentLevel; 
//         const { utrNumber, bankAccount, ifscCode } = req.body;

//         // Level ko Number mein convert karna zaroori hai
//         const levelData = WITHDRAWAL_LEVELS[Number(levelKey)]; 

//         if (!levelData) {
//             return res.status(400).json({ message: "Invalid Withdrawal Level" });
//         }

//         const user = await userModel.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // Processing... baki logic same rahega
//         const newWithdrawal = new Withdrawal({
//             userId,
//             amount: levelData.amount,
//             processingFee: levelData.fee,
//             level: Number(levelKey),
//             bankAccount,
//             ifscCode,
//             utrNumber,
//             paymentImage: req.file ? req.file.filename : null,
//             status: 'pending'
//         });

//         await newWithdrawal.save();
//         res.status(200).json({ message: "Request submitted successfully" });

//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
export const withdrawRequest = async (req, res) => {
    try {
        // ID nikaalne ke 3 tarike: req.id (Auth middleware), req.userId (Fallback), ya body se.
        const userId = req.id || req.userId || req.body.userId;
        
        const { utrNumber, bankAccount, ifscCode, level } = req.body;

        if (!userId) {
            return res.status(401).json({ message: "Authentication failed. User ID missing." });
        }

        // 1. User dhoondo
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found in Database" });
        }

        // 2. Level Check (frontend se data string aata hai, isliye Number() lagaya)
        const levelData = WITHDRAWAL_LEVELS[Number(level)];
        if (!levelData) {
            return res.status(400).json({ message: "Invalid Withdrawal Level" });
        }

        // 3. Wallet Balance Check
        if (user.walletAmount < levelData.amount) {
            return res.status(400).json({ 
                message: `Insufficient balance! Level ${level} needs ₹${levelData.amount}` 
            });
        }

        // 4. Save Request (Status: pending)
        const newWithdrawal = new Withdrawal({
            userId: user._id,
            amount: levelData.amount,
            processingFee: levelData.fee,
            level: Number(level),
            bankAccount,
            ifscCode,
            utrNumber,
            paymentImage: req.file ? req.file.filename : null,
            status: 'pending' 
        });

        await newWithdrawal.save();
        res.status(200).json({ message: "Withdrawal request submitted for Admin review!" });

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ message: error.message });
    }
};



export const getMyLastWithdrawal = async (req, res) => {
    try {
        const lastWithdraw = await Withdrawal.findOne({ userId: req.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: lastWithdraw });
    } catch (err) {
        res.status(500).json({ message: "Error fetching status" });
    }
}

// --- ADMIN: APPROVE WITHDRAWAL (Level Up + Money Deduct) ---
// export const approveWithdrawal = async (req, res) => {
//     try {
//         const { withdrawalId } = req.params;
//         const withdrawal = await Withdrawal.findById(withdrawalId);

//         if (!withdrawal || withdrawal.status !== 'pending') {
//             return res.status(400).json({ message: "Request not found or already approved" });
//         }

//         const user = await userModel.findById(withdrawal.userId);
//         if (!user) return res.status(404).json({ message: "User no longer exists" });

//         // Logic: Approved hone par hi paise katenge
//         user.walletAmount -= withdrawal.amount;
//         user.totalAmount = (user.totalAmount || 0) + withdrawal.amount;

//         // 10-Level Cycle Logic (Stage 1 to 10)
//         let nextStage = (user.withdrawalStage || 1) + 1;
//         if (nextStage > 10) {
//             nextStage = 1; // 10 ke baad Stage 1 par reset
//         }
//         user.withdrawalStage = nextStage;

//         withdrawal.status = 'approved';

//         await user.save();
//         await withdrawal.save();

//         res.status(200).json({ message: "Withdrawal Approved! Level updated successfully." });

//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };


export const approveWithdrawal = async (req, res) => {
    try {
        const { withdrawalId } = req.params;
        const { isAccept } = req.body; // Frontend se "Accepted" ya "Rejected" aayega

        const withdrawal = await Withdrawal.findById(withdrawalId);

        if (!withdrawal || withdrawal.status !== 'pending') {
            return res.status(400).json({ message: "Request not found or already processed" });
        }

        // --- 1. AGAR ADMIN NE REJECT KIYA ---
        if (isAccept === "Rejected") {
            withdrawal.status = 'rejected';
            await withdrawal.save();
            return res.status(200).json({ message: "Withdrawal request rejected successfully." });
        }

        // --- 2. AGAR ADMIN NE ACCEPT KIYA ---
        if (isAccept === "Accepted") {
            const user = await userModel.findById(withdrawal.userId);
            if (!user) return res.status(404).json({ message: "User no longer exists" });

            // Check balance before deduction (safety check)
            if (user.walletAmount < withdrawal.amount) {
                return res.status(400).json({ message: "User has insufficient balance now." });
            }

            // A. Wallet se pura Level Amount kaatna
            user.walletAmount -= withdrawal.amount;

            // B. Payout tracking (Total Amount = Jo user ko mila i.e Amount - Fee)
            const payout = withdrawal.amount - (withdrawal.processingFee || 0);
            user.totalAmount = (user.totalAmount || 0) + payout;

            // C. 10-Level Cycle Logic (Stage 1 to 10)
            let nextStage = (user.withdrawalStage || 1) + 1;
            if (nextStage > 10) {
                nextStage = 1; // 10 ke baad Stage 1 par reset
            }
            user.withdrawalStage = nextStage;

            // D. Status change to approved
            withdrawal.status = 'approved';

            await user.save();
            await withdrawal.save();

            return res.status(200).json({ message: "Withdrawal Approved! Balance deducted and Level increased." });
        }

        // Agar kuch bhi match nahi hua (fallback)
        return res.status(400).json({ message: "Invalid action selected." });

    } catch (error) {
        console.error("Approval Error:", error);
        res.status(500).json({ message: error.message });
    }
};
// 2. Admin Approves (Balance deduction & Level increment)
// export const approveWithdrawal = async (req, res) => {
//     try {
//         const { withdrawalId } = req.params; // Admin panel se ID aayegi
//         const withdrawal = await Withdrawal.findById(withdrawalId);

//         if (!withdrawal || withdrawal.status !== 'pending') {
//             return res.status(400).json({ message: "Invalid or already processed request" });
//         }

//         const user = await userModel.findById(withdrawal.userId);

//         // Deduct money and update totals
//         user.walletAmount -= withdrawal.amount;
//         user.totalAmount = (user.totalAmount || 0) + (withdrawal.amount - withdrawal.processingFee);

//         // 10-Level Cycle Logic
//         let nextStage = (user.withdrawalStage || 1) + 1;
//         if (nextStage > 10) nextStage = 1; // 10 ke baad wapis 1
//         user.withdrawalStage = nextStage;

//         withdrawal.status = 'approved';

//         await user.save();
//         await withdrawal.save();

//         res.status(200).json({ message: "Withdrawal approved and level updated!" });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };