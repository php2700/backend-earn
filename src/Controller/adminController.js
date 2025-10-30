import AdminModel from "../Models/adminModel.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import userModel from "../Models/userModel.js";
import referAmountModel from "../Models/referAmount.js";
import ContactModel from "../Models/contactModel.js";
import WithdrawModel from "../Models/withdrawModel.js";


const checkPassword = async (password, hashPassword) => {
  const verifyPassword = await bcrypt.compare(password, hashPassword);
  if (verifyPassword) return verifyPassword;
  throw new Error('Email and Password wrong')
}

const generateToken = async (userData) => {
  const token = await jwt.sign({ id: userData?.id, role: userData?.role }, process.env.JWT_SECRET_KEY, { algorithm: process.env.JWT_ALGORITHM, expiresIn: process.env.JWT_EXPIRE_TIME });
  if (token) return token;
  throw new Error('something went wrong')

}

export const Login = async (req, res, next) => {
  try {
    const { email, password } = req?.body;

    const isExistEmail = await AdminModel.findOne({ email: email });
    if (!isExistEmail) return res.status(404).json({ success: false, message: 'email not valid' })

    await checkPassword(password, isExistEmail?.password);
    const token = await generateToken(isExistEmail);

    const userData = {
      _id: isExistEmail?._id,
      role: isExistEmail?.role,
      token: token
    }
    return res.status(200).json({ message: 'login-successfully', data: userData })
  } catch (error) {
    next(error)
  }
}


export const userList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const search = req.query.search.trim() || "";
    const skip = (page - 1) * limit;

    const total = await userModel.countDocuments();
    const users = await userModel.aggregate([
      ...(search
        ? [
          {
            $match: {
              $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
              ],
            },
          },
        ]
        : []),
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "refers",
          localField: "_id",
          foreignField: "referById",
          as: "referrals"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "referrals.referTo",
          foreignField: "_id",
          as: "referralsDetails"
        }
      },
      {
        $addFields: {
          referrals: {
            $map: {
              input: "$referrals",
              as: "ref",
              in: {
                _id: "$$ref._id",
                referTo: "$$ref.referTo",
                createdAt: "$$ref.createdAt",
                userDetails: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$referralsDetails",
                        as: "r",
                        cond: { $eq: ["$$r._id", "$$ref.referTo"] }
                      }
                    },
                    0
                  ]
                }
              }
            }
          }
        }
      },

      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          registerBy: 1,
          walletAmount: 1,
          referralCode: 1,
          isActivate: 1,
          upiId: 1,
          createdAt: 1,
          updatedAt: 1,
          referrals: 1
        }
      },

      { $skip: skip },
      { $limit: limit }
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};


export const referList = async (req, res, next) => {
  try {
    const referList = await userModel.aggregate([
      { $match: { referredBy: { $ne: null }, isAppliedLoan: true } },
      {
        $lookup: {
          from: "users",
          localField: "referredBy",
          foreignField: "referralCode",
          as: "referrer"
        }
      },
      { $unwind: "$referrer" },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          registerBy: 1,
          referredBy: 1,
          "referrer.name": 1,
          "referrer.email": 1
        }
      }
    ]);

    res.status(200).json(referList);
  } catch (error) {
    next(error);
  }
};



export const getReferAmount = async (req, res) => {
  try {
    const referAmount = await referAmountModel.findOne();
    if (!referAmount) {
      return res.status(404).json({ message: "Referral amount not found" });
    }
    res.json(referAmount);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const withdrawReqList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const total = await WithdrawModel.countDocuments();
    const withReqData = await WithdrawModel.find()
      .populate('userId')
      .skip(skip).limit(limit)
      .sort({ createdAt: -1 })


    res.json({
      success: true,
      data: withReqData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });


  } catch (error) {
    next(error)
  }
}


export const updateReferAmount = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }
    let referAmount = await referAmountModel.findOne();
    if (!referAmount) {
      referAmount = new referAmountModel({ amount });
    } else {
      referAmount.amount = amount;
    }
    await referAmount.save();
    res.json({ message: "Referral amount updated successfully", referAmount });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const contactList = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await ContactModel.countDocuments();
    const contactData = await ContactModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    return res.json({
      success: true,
      data: contactData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error)
  }
}

export const sendPayment = async (req, res, next) => {
  try {
    const { _id, userId, amount, isAccept } = req.body;
    if (!userId || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const withdrawReqData = await WithdrawModel.findOne({ _id: _id });
    if (withdrawReqData.isAccept == 'Accepted') {
      return res.status(200).json({ success: true, message: 'Already Accepted' })
    }
    if (isAccept == 'Rejected') {
      withdrawReqData.isAccept = isAccept;
      await withdrawReqData.save();
      return res.status(200).json({ success: true, message: 'withdraw req rejected' })
    }
    else if (isAccept == 'Accepted') {
      withdrawReqData.isAccept = isAccept;
      await withdrawReqData.save();
      const userData = await userModel.findOne({ _id: userId });
      userData.walletAmount = userData.walletAmount - amount;
      userData.totalAmount = userData.totalAmount + amount;
      await userData.save();
      return res.status(200).json({ success: true, message: 'accepted ' })
    }
    return res.status(200).json({ success: true, message: 'withdraw req updated' })

  } catch (error) {
    next(error)
  }
}

export const counts = async (req, res, next) => {
  try {
    const result = await userModel.aggregate([
      {
        $facet: {
          totalUsers: [{ $count: "count" }],
          activeUsers: [
            { $match: { isActivate: true } },
            { $count: "count" },
          ],
          inactiveUsers: [
            { $match: { isActivate: false } },
            { $count: "count" },
          ],
          totalPayout: [
            { $group: { _id: null, sum: { $sum: "$totalAmount" } } },
          ],
        },
      },
      {
        $project: {
          userCount: { $arrayElemAt: ["$totalUsers.count", 0] },
          active: { $arrayElemAt: ["$activeUsers.count", 0] },
          inActive: { $arrayElemAt: ["$inactiveUsers.count", 0] },
          totalPayout: { $arrayElemAt: ["$totalPayout.sum", 0] },
        },
      },
    ]);

    const stats = result[0] || {};
    return res.status(200).json({
      success: true,
      userCount: stats.userCount || 0,
      active: stats.active || 0,
      inActive: stats.inActive || 0,
      totalPayout: stats.totalPayout || 0,
    });
  } catch (error) {
    next(error);
  }
};
