import express, { Router } from "express"
import { addContact, getReferralsByCode, getUserData, LoginWithGoogle, refferBy } from "../Controller/userController.js";
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

//contact
userRouter.post('/contact', addContact)



export default userRouter