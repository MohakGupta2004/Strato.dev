import express from 'express'
import { validationResult } from 'express-validator';
import {generateNonce, SiweMessage} from 'siwe'
import jwt, { type JwtPayload } from 'jsonwebtoken'
interface AddressDecodedToken extends JwtPayload {
    address: string; // Ensure 'address' is included
}
export const nonceController = (req:express.Request, res: express.Response)=>{
    const nonce = generateNonce();
    res.status(200).json({ nonce });
}
export const verifyWalletController = async (req:express.Request, res: express.Response)=>{
    const errors = validationResult(req.body)
    if(!errors.isEmpty()){
        res.status(400).json(errors)
        return;
    }
    
    const { message, signature } = req.body;

    try {
      const siweMessage = new SiweMessage(message);
      const result = await siweMessage.verify({ signature });
  
      if (!result.success) {
        res.status(400).json({ error: "Signature verification failed" });
        return;
      }
  
      const address = result.data.address;
      console.log("User authenticated:", address);
  
      // 🔥 Generate JWT token
      const token = jwt.sign({ address }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  
      // 🔥 Set JWT as a secure HTTP-only cookie
      res.cookie("auth_token", token, {
        httpOnly: true, // Prevents XSS
        secure: process.env.NODE_ENV === "production", // Only allow HTTPS in production
        sameSite: "strict", // CSRF protection
      });
  
      res.status(200).json({ ok: true, address });
    } catch (error) {
      console.error("Verification Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
}
export const walletUser = (req:express.Request, res: express.Response)=>{
  const token = req.cookies?.auth_token; // 🔥 Read cookie properly

  if (!token) {
    res.status(401).json({ error: "User not logged in" }); // 🔥 If no token, user is not authenticated
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AddressDecodedToken
    res.status(200).json({ address: decoded.address }); // 🔥 Return Ethereum address if authenticated
  } catch (error) {
    res.status(401).json({ error: "Invalid session" }); // 🔥 Invalid token (expired or tampered)
  }
}
export const logoutWalletController = (req:express.Request, res: express.Response)=>{
    console.log("Signing out");
    res.clearCookie("auth_token");
    res.status(200).json({ ok: true });
}
