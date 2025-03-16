import http from "http";
import app from "./app";
import { Server } from "socket.io";
import { socketAuthMiddleware, type AuthenticatedSocket } from "./middlewares/socket.middleware";

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true, // ✅ Allow credentials for authentication
  },
  transports: ["websocket"], // ✅ Ensure WebSocket is used
});

io.use(socketAuthMiddleware);

io.on("connection", (socket: AuthenticatedSocket) => {
  console.log("✅ SOCKET.IO CONNECTED:", socket.id);
  socket.join(socket.project?._id as string)
  
  socket.on('project-message', (data)=>{
    io.to(socket.project?._id as string).emit('project-message',data)
  })
  socket.on('disconnect', ()=>{
    socket.leave(socket.project?._id as string)
  })
});

server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
