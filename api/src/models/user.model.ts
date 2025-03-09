import { Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
interface IUser extends Document {
  email: string;
  password: string
}

interface IUserMethods {
  generateJWT(): string;
  isValidPassword(password: string): Promise<boolean>
}

interface UserModel extends Model<IUser, {}, IUserMethods>{
  hashPassword(password: string): Promise<string>
}

const userSchema =  new mongoose.Schema<IUser, UserModel>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    select: false,
    required: true,
    unique: true,
    min: [6, "password at least contain 6 character"]
  }
})

userSchema.statics.hashPassword = async function(password){
  return await bcrypt.hash(password, 10)
}

userSchema.methods.isValidPassword = async function(password: string){
  return await bcrypt.compare(password, this.password) 
}

userSchema.methods.generateJWT = function(){
  return jwt.sign({email: this.email}, process.env.JWT_SECRET || "YOUR_JWT_SECRET", {
    expiresIn: '24h'
  })
}

export const User = mongoose.model<IUser, UserModel>("User", userSchema)
