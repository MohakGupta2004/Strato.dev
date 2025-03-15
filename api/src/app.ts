import express from 'express'
import { connectDB } from './db/db'
import authRouter from './routes/auth.route'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import projectRouter from './routes/project.route'
const app = express()
connectDB()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true 
}))
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/project', projectRouter)
app.get('/', (req, res)=>{
  res.send("Health Check")
})

export default app
