import { User } from "../models/user.model";
import { checkUser, createUser } from "../services/auth.service";
import express from 'express'
import { validationResult } from "express-validator";
import redis from "../services/redis.service";

export const createUserController = async (req: express.Request, res: express.Response)=>{
  const errors = validationResult(req)
 
  if(!errors.isEmpty()){
    res.status(400).json({
     errors: errors.array()
    }) 
  }
  
  try {
   const userResult = await createUser(req.body)
   const userObject:{
    password?:string
   } = userResult.toObject();
   delete userObject.password;
   const token = userResult.generateJWT()
   res.status(200).json({userObject, token})
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
   const userObject:{
    password?:string
   } = userResult.toObject();
   delete userObject.password;
   const token = userResult.generateJWT()
   res.status(200).json({userObject, token})
  } catch (error: any) {
   res.status(400).json(error.message) 
  }
}


export const profileController = async (req: express.Request, res: express.Response)=>{
  res.status(200).json({
    message: req.user
  })  
}


export const logoutController = async (req: express.Request, res: express.Response)=>{
  try {
   const token = req.cookies.token || req.headers.authorization?.split(" ")[1] 
   await redis.set(token, 'logout', 'EX', 60*60*24)
   res.status(200).json({
      message: "Logged Out Successfully"
   })
  } catch (
    error: any
  ) {
    res.status(400).status(error) 
  }
}
