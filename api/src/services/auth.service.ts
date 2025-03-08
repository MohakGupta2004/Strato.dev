import { User } from "../models/user.model";

export const createUser = async({email, password}:{
  email: string,
  password: string
})=>{
  if(!email || !password){
    throw new Error("No username or password mentioned")
  } 
  const hashedPassword = await User.hashPassword(password)
  const user = await User.create({
    email,password: hashedPassword
  })
  return user; 
} 


export const checkUser = async({email, password}:{
  email:string,
  password: string
})=>{
  const user = await User.findOne({
    email
  }).select("+password")
  if(!user){
    throw new Error("User doesn't exist")
  }
  const hashedPassword = await User.hashPassword(password)
  if(await user?.isValidPassword(hashedPassword)){
    return user
  }
  return user
}
