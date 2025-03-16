import { Router } from "express";
import { body } from "express-validator";
import { aiResponseController } from "../controllers/ai.controller";
import authMiddleware from "../middlewares/auth.middleware";

const aiRouter = Router()

aiRouter
    .post('/', aiResponseController ),
    authMiddleware,
    body("prompt").isString()
    
export default aiRouter