import { Router } from "express";
import { logoutWalletController, nonceController, verifyWalletController, walletUser } from "../controllers/wallet.controller";
import { body } from "express-validator";
const walletRouter = Router()

walletRouter
    .get('/nonce', nonceController)
    .post('/verify',
    body("message").isString(),
    body("signature").isString(),
    verifyWalletController)
    .get('/me', walletUser)
    .post('/logout', logoutWalletController)
export default walletRouter