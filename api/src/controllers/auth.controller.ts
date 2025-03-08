import { User } from "../models/user.model";
import { checkUser, createUser } from "../services/auth.service";
import express from 'express'
import { validationResult } from "express-validator";

export const createUserController = async (req: express.Request, res: express.Response)=>{
  const errors = validationResult(req)
 
  if(!errors.isEmpty()){
    res.status(400).json({
     errors: errors.array()
    }) 
  }
  
  try {
   const userResult = await createUser(req.body)
   const token = userResult.generateJWT()
   res.status(200).json({userResult, token})
  } catch (error: any) {
   res.status(400).json(error.message) 
  }
}


export const loginController = async (req: express.Request, res: express.Response)=>{
  const errors = validationResult(req)
 
  if(!errors.isEmpty()){
    res.status(400).json({
     errors: errors.array()
    }) 
  }
 
  try {
   const userResult = await checkUser(req.body)
   if(!userResult){
    res.status(401).json({message: "Unauthorized"})  
    return;
   }
   const token = userResult.generateJWT()
   res.status(200).json({userResult, token})
  } catch (error: any) {
   res.status(400).json(error.message) 
  }
}


export const profileController = async (req: express.Request, res: express.Response)=>{
  res.status(200).json({
    message: req.user
  })  
}
