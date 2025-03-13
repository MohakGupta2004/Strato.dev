import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken'
import redis from "../services/redis.service";
interface DecodedToken extends JwtPayload{
  _id: string
 email: string 
}
const authMiddleware = async (req: Request, res: Response, next: NextFunction )=>{
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  const blackListToken = await redis.get(token)
  if(blackListToken){
    res.clearCookie(token)
    res.status(401).json({
      error: "Blacklisted Token"
    })
  }
  if(!token){
    res.status(401).json({message: "Unauthorized"})
    return;
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken
  console.log(decoded)
  req.user = decoded
  next() 
}

export default authMiddleware
