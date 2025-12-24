import express, { Router } from "express"
import { addContact, edit, getReferralsByCode, claimReferralCoupon, getTodayRewardPreview , getUserData,claimDailyPoints , convertPoints, LoginWithGoogle, paymentConfig, paymentProof, refferBy, userTransaaction, withdrawAmount ,      activateUsers, getTodayRewardPreviews ,claimDailyPointss ,claimReferralCoupons ,} from "../Controller/userController.js";
import upload from "../Middleware/upload.js";
import { authentication } from "../Middleware/authentication.js";
import { authorization } from "../Middleware/authorization.js";


const userRouter = express.Router();
userRouter.get('/payment-config',authentication, authorization(['user']),paymentConfig)


// login 
userRouter.get("/:id", authentication, authorization(['user']), getUserData)
userRouter.post("/google-login", LoginWithGoogle)

// reffered
userRouter.patch("/update-refferBy", refferBy)
userRouter.get("/referrals/:userId", authentication, authorization(['user']), getReferralsByCode);

//activation user and generate reffer code of the user
userRouter.patch("/payment-proof", authentication, authorization(['user']), upload.single("paymentImage"), paymentProof);
userRouter.patch('/edit', authentication, authorization(['user']), edit)

//withdraw amount req
userRouter.post("/withdraw", authentication, authorization(['user']), withdrawAmount);

/*------------- user Transaction Details---------------- */
userRouter.get('/transaction-list/:userId',authentication, authorization(['user']),userTransaaction )

//contact
userRouter.post('/contact', addContact)



/* ----------------------------------------------------------------------- */

// User Transaction Details
// userRouter.get('/transaction-list/:userId', authentication, authorization(['user']), userTransaaction )


userRouter.post("/claim-daily-points", authentication, authorization(['user']), claimDailyPoints);

// 2. पॉइंट्स को रियल मनी (₹) में कन्वर्ट करने के लिए (Claim Button)
userRouter.post("/convert-points", authentication, authorization(['user']), convertPoints);


userRouter.get('/today-reward-points/:userId', authentication, authorization(['user']), getTodayRewardPreview)
userRouter.post('/claim-referral-coupon', authentication, authorization(['user']), claimReferralCoupon)











export default userRouter