import { validationResult } from "express-validator";
import {getFileTreeService, addUser, checkProjectUser, createProject, getProjectFromName, getProjects, updateFileTreeService } from "../services/project.service";
import express from 'express'

export const createProjectController = async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json(errors)
        return;
    }
    try {
        const { name } = req.body
        const userId = req.user?._id
        if (!userId) {
            res.status(400).json({
                message: "User doesn't exist"
            })
            return;
        }
        const result = await createProject(userId, name)
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
    }
}

export const getProjectsController = async (req: express.Request, res: express.Response) => {
    const id = req.user?._id
    if (!id) {
        res.status(400).json({
            message: "Unauthorized"
        })
        return;
    }
    const result = await getProjects(id);
    res.status(200).json(result)
}


export const addUserController = async (req: express.Request, res: express.Response) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json(errors)
            return
        }
        const { name, email } = req.body
        const user = req.user
        if (!user) {
            res.status(400).json({
                message: "Unauthorized"
            })
            return;
        }
        const result = await addUser(name, email, user)
        if (!result) {
            res.status(401).json(result)
            return
        }
        res.status(200).json({
            message: result
        })
    } catch (error) {
        console.log(error)
    }
}

export const checkProjectUserController = async (req: express.Request, res: express.Response) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json(errors)
        }
        const { name } = req.body
        const user = req.user
        if (!user) {
            res.status(400).json({
                message: "Unauthorized"
            })
            return;
        }
        const result = await checkProjectUser(name, user);
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
    }
}

export const getProjectUserFromNameController = async (req: express.Request, res: express.Response) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.status(400).json(errors)
        }
        const { name } = req.params
        if (!name) {
            res.status(400).json({
                message: "Name doesn't exist"
            })
        }
        const result = await getProjectFromName(name)
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
    }

}

export const updateFileTree = async (req: express.Request, res: express.Response) => {
    try {
        const errors = validationResult(req.body)
        if (!errors.isEmpty()) {
            res.status(400).json(errors)
            return;
        }

        const { fileTree, projectId } = req.body;
        const result = await updateFileTreeService(projectId, fileTree)
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
    }
}

export const getFileTree = async (req: express.Request, res: express.Response) => {
    try {
        const errors = validationResult(req.body)
        if (!errors.isEmpty()) {
            res.status(400).json(errors)
            return;
        }

        const { projectId } = req.body;
        const result = await getFileTreeService(projectId)
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
    }
}