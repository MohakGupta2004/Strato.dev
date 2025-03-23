import express from 'express'
import { validationResult } from 'express-validator'
import { gitService } from '../services/git.service'


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