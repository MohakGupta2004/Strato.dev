import type { Socket } from "socket.io";
import jwt from 'jsonwebtoken'
interface DecodedUser{
  _id: string,
  email: string
}
interface AuthenticatedSocket extends Socket {
  user?: DecodedUser;
}
export const socketAuthMiddleware = (socket: AuthenticatedSocket, next: (err?: any)=>void)=>{
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1]
    if(!token){
      throw new Error("Token Error")
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedUser

    if(!decoded){
      throw new Error("JWT malformed")
    }

    socket.user = decoded
    next()
  } catch (error) {
    next(error) 
  }

}
