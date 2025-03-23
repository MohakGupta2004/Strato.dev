import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { body } from "express-validator";
import { gitController } from "../controllers/git.controller";
const gitRouter = Router()

gitRouter
    .post("/create", 
    authMiddleware,
    body("repo").isString(),
    gitController
    )
    

export default gitRouter