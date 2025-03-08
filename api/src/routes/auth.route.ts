import { Router } from "express";
import { createUserController, loginController, profileController } from "../controllers/auth.controller";
import { body } from "express-validator";
import authMiddleware from "../middlewares/auth.middleware";
const authRouter = Router()

authRouter.post('/register', 
  body('email').isEmail().withMessage("Email must be a valid email"),
  body('password').isLength({min: 6}).withMessage("Passoword should be at least 6 characters"), 
  createUserController)

authRouter.post('/login', 
  body('email').isEmail().withMessage("Email must be a valid email"),
  body('password').isLength({min: 6}).withMessage("Passoword should be at least 6 characters"), 
  loginController)

authRouter.get('/profile',authMiddleware, profileController)

export default authRouter
