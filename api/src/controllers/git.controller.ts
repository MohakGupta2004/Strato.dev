import express from 'express'
import { validationResult } from 'express-validator'
import { gitService, pushToGithubService } from '../services/git.service'


export const gitController = async(req: express.Request, res: express.Response)=>{
    try {
        const errors = validationResult(req.body)
        if(!errors.isEmpty()){
            res.status(400).json(errors)
            return;
        }
    
        const {repo} = req.body
        const result = await gitService(repo)
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
    }
}

export const pushToGithubController = async (req: express.Request, res: express.Response)=>{
    try {
        const errors = validationResult(req.body)
        if(!errors.isEmpty()){
            res.status(400).json(errors)
            return;
        }
    
        const {repoUrl, token, fileTree, message} = req.body
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)\.git$/);
        if (!match) {
         res.status(400).json({ error: "Invalid GitHub repository URL format!" });
         return
        }

        const owner = match[1];
        const repo = match[2];


        const result = await pushToGithubService(token, owner, repo, fileTree, message)
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
}