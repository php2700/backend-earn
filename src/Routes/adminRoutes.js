import express from 'express'
import { contactList, getReferAmount, Login, referList, updateReferAmount, userList, withdrawReqList } from '../Controller/adminController.js';
import { authentication } from '../Middleware/authentication.js';
import { authorization } from '../Middleware/authorization.js';

const adminRouter = express.Router()

adminRouter.post('/login', Login)
adminRouter.get('/userList', authentication, authorization(['admin']), userList)
adminRouter.get('/referList', authentication, authorization(['admin']), referList)


// refer amount edit and get
adminRouter.get('/refer-amount', authentication, authorization(['admin', 'user']), getReferAmount)
adminRouter.patch('/refer-amount', authentication, authorization(['admin']), updateReferAmount)

/*withdraw req-list */
adminRouter.get('/withdraw-req-list', authentication, authorization(['admin']), withdrawReqList)



//contact lsit
adminRouter.get('/contact-list', authentication, authorization(['admin']), contactList)



export default adminRouter;