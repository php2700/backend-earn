import express, { Router } from "express"
import { activateReferCode, addContact, edit, getReferralsByCode, getUserData, LoginWithGoogle, refferBy, withdrawAmount } from "../Controller/userController.js";
import upload from "../Middleware/upload.js";
import { authentication } from "../Middleware/authentication.js";
import { authorization } from "../Middleware/authorization.js";


const userRouter = express.Router();

// login 
userRouter.get("/:id", authentication, authorization(['user']), getUserData)
userRouter.post("/google-login", LoginWithGoogle)

// reffered
userRouter.patch("/update-refferBy", refferBy)
userRouter.get("/referrals/:userId", authentication, authorization(['user']), getReferralsByCode);

//activation user and generate reffer code of the user
userRouter.patch("/activate", authentication, authorization(['user']), activateReferCode);
userRouter.patch('/edit', authentication, authorization(['user']), edit)

//withdraw amount req
userRouter.post("/withdraw", authentication, authorization(['user']), withdrawAmount);

//contact
userRouter.post('/contact', addContact)

export default userRouter