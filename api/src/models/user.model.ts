import { Model, Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

interface IUser extends Document {
  email: string;
  password: string;
  generateJWT(): string;
  isValidPassword(password: string): Promise<boolean>;
}

interface UserModel extends Model<IUser> {
  hashPassword(password: string): Promise<string>;
}

const userSchema = new Schema<IUser, UserModel>({
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
    minlength: [6, "Password must be at least 6 characters long"],
  },
});

// Hash password before saving (static method)
userSchema.statics.hashPassword = async function (password: string) {
  return await bcrypt.hash(password, 10);
};

// Check if password is valid
userSchema.methods.isValidPassword = async function (password: string) {
  const user = await mongoose.model<IUser>("User").findById(this._id).select("+password");
  if (!user) return false;
  return await bcrypt.compare(password, user.password);
};

// Generate JWT Token
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    { email: this.email },
    process.env.JWT_SECRET || "YOUR_JWT_SECRET",
    { expiresIn: "24h" }
  );
};

export const User = mongoose.model<IUser, UserModel>("User", userSchema);
