import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken'

interface DecodedToken extends JwtPayload{
 email: string 
}
const authMiddleware = async (req: Request, res: Response, next: NextFunction )=>{
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if(!token){
    res.status(401).json({message: "Unauthorized"})
    return;
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken
  req.user = decoded
  next() 
}

export default authMiddleware
