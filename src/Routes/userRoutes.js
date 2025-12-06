import express, { Router } from "express"
import { addContact, edit, getReferralsByCode, getUserData, LoginWithGoogle, paymentConfig, paymentProof, refferBy, userTransaaction, withdrawAmount } from "../Controller/userController.js";
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

export default userRouter