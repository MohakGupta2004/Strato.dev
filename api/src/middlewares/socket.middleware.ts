import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Project } from "../models/project.model";

interface ProjectType {
  _id: string;
  name: string;
  users: Array<string>;
}

interface DecodedUser {
  _id: string;
  email: string;
}

export interface AuthenticatedSocket extends Socket {
  user?: DecodedUser;
  project?: ProjectType | null;
}

export const socketAuthMiddleware = async (socket: AuthenticatedSocket, next: (err?: any) => void) => {
  try {
    const token =
      socket.handshake.auth?.token?.split(" ")[1] ||
      socket.handshake.headers.authorization?.split(" ")[1];

    const projectId = socket.handshake.query.projectId as string;

    if (!token) {
      return next(new Error("Token Error: No token provided"));
    }

    if (!projectId) {
      return next(new Error("Missing project ID"));
    }

    // ✅ Validate MongoDB ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid Project ID format"));
    }

    // ✅ Query database only if ID is valid
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new Error("Project not found"));
    }

    
    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedUser;
    if (!decoded) {
      return next(new Error("JWT malformed"));
    }
    
    socket.project = {
      _id: project._id.toString(),
      name: project.name,
      users: project.users.map((user) => user.toString()), // Convert user ObjectIds to strings
    };
    socket.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Socket Auth Middleware Error:", error);
    next(new Error("Authentication failed"));
  }
};
