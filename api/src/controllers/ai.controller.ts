import express from 'express'
import { validationResult } from 'express-validator'
import { aiResponse } from '../services/ai.service'

export const aiResponseController = async(req: express.Request, res: express.Response)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        res.status(400).json(errors)
    }

    const prompt = req.body.prompt as string
    if(!prompt){
        res.status(400).json({
            message: "No prompt given"
        })
        return;
    }
    const result = await aiResponse(prompt)
    if(!result){
        res.status(400).json({
            message: "No response given"
        })
        return;
    }
    res.status(200).send(result)
}