import http from 'http'
import app from './app'
import {Server} from 'socket.io'
import { socketAuthMiddleware } from './middlewares/socket.middleware'
const server = http.createServer(app)
const PORT = process.env.PORT || 3000 

const io = new Server(server)
io.use(socketAuthMiddleware)
io.on('connection', ()=>{
  console.log("SOCKETIO CONNECTED")
})

server.listen(PORT, ()=>{
  console.log(`Server is running at ${PORT}`)
})
