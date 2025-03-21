import { Router, query } from "express";
import { getFileTree, addUserController, checkProjectUserController, createProjectController, getProjectUserFromNameController, getProjectsController, updateFileTree } from "../controllers/project.controller";
import { body, param } from "express-validator";
import authMiddleware from "../middlewares/auth.middleware";

const projectRouter = Router()

projectRouter
    .get('/', authMiddleware, getProjectsController)
    .get('/:name', authMiddleware,
     param("name").isString(),
     getProjectUserFromNameController)
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
    .put('/save-filetree', authMiddleware,
        body('projectId').isString(),
        body('fileTree').isObject(),
        updateFileTree)
    .post('/get-filetree', authMiddleware,
        body('projectId').isString(),
        getFileTree
    )
    
export default projectRouter
