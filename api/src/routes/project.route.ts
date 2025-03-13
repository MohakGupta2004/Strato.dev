import { Router, query } from "express";
import { addUserController, checkProjectUserController, createProjectController, getProjectsController } from "../controllers/project.controller";
import { body, param } from "express-validator";
import authMiddleware from "../middlewares/auth.middleware";

const projectRouter = Router()

projectRouter
    .get('/', authMiddleware, getProjectsController)
    .post('/create',
        authMiddleware,
        body('name').isString()
        , createProjectController)

    .post('/add', authMiddleware, 
        body("name").isString(),
        body('email').isEmail().withMessage("Must be an email")
        , addUserController
    )
    .post('/check', authMiddleware,
        body("name").isString()
        , checkProjectUserController
    )
    
export default projectRouter