import express from 'express'
import { contactList, counts, getReferAmount, Login, referList, sendPayment, updateReferAmount, userList, withdrawReqList } from '../Controller/adminController.js';
import { authentication } from '../Middleware/authentication.js';
import { authorization } from '../Middleware/authorization.js';
import { activateReferCode } from '../Controller/userController.js';

const adminRouter = express.Router()

adminRouter.post('/login', Login)
adminRouter.get('/userList', authentication, authorization(['admin']), userList)
adminRouter.get('/referList', authentication, authorization(['admin']), referList)


// refer amount edit and get
adminRouter.get('/refer-amount', authentication, authorization(['admin', 'user']), getReferAmount)
adminRouter.patch('/refer-amount', authentication, authorization(['admin']), updateReferAmount)

/*withdraw req-list */
adminRouter.post('/send-payment', authentication, authorization(['admin']), sendPayment)
adminRouter.get('/withdraw-req-list', authentication, authorization(['admin']), withdrawReqList)


//contact lsit
adminRouter.get('/contact-list', authentication, authorization(['admin']), contactList)

//activate user 
adminRouter.patch("/activate-user", authentication, authorization(['admin']), activateReferCode);



//dashboard
adminRouter.get('/count', authentication, authorization(['admin']), counts)



export default adminRouter;