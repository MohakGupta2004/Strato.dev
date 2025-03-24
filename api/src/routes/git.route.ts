import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { body } from "express-validator";
import { gitController, pushToGithubController } from "../controllers/git.controller";
const gitRouter = Router()

gitRouter
    .post("/create", 
    authMiddleware,
    body("repo").isString(),
    gitController
    )
    .post("/push",
    authMiddleware,
    body("token").isString(),
    body("repourl").isString(),
    body("fileTree").isObject(),
    body("message").isString(),
    pushToGithubController
    )

export default gitRouter