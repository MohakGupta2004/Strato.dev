import { Project } from "../models/project.model";
import { User } from "../models/user.model";

export const createProject = async (userId: string, projectName: string) => {
    try {
        if (!userId || !projectName) {
            return { message: "No userID or projectName mentioned" };
        }

        // Ensure projectName is lowercase before searching (to match DB format)
        projectName = projectName.toLowerCase();

        const existingProject = await Project.findOne({ name: projectName });
        if (existingProject) {
            return { message: "Project already exists" };
        }

        const projectDetails = await Project.create({
            name: projectName,
            users: [userId]
        });

        console.log("PROJECT DETAILS FROM SERVICE", projectDetails);
        return projectDetails;
    } catch (error: any) {
        return { message: error.message };
    }
};

export const getProjects = async (userId: string) => {
    try {
        if (!userId) {
            return { message: "User ID is required" };
        }

        // Find projects where the user is in the `users` array
        const projectDetails = await Project.find({ users: userId });

        return projectDetails.length ? projectDetails : { message: "No projects found" };
    } catch (error: any) {
        return { message: error.message };
    }
};

export const addUser = async (name: string, email: string, user: { _id: string; email: string }) => {
    try {
        // Find the user by email
        const userDetails = await User.findOne({ email });
        if (!userDetails) {
            return { message: "User not found" };
        }

        // Update project by pushing new user ID only if it's not already in the array
        const addUserDetails = await Project.updateOne(
            {
                name: name,
                users: { $ne: userDetails._id } // Ensures user is not already added
            },
            {
                $push: { users: userDetails._id }
            }
        );

        // Check if a document was actually modified
        if (addUserDetails.modifiedCount === 0) {
            return { message: "User already exists or project not found" };
        }

        return { message: "User added successfully" };
    } catch (error: any) {
        return { message: error.message };
    }
};


export const checkProjectUser = async(name: string, user:{_id: string, email: string})=>{
    try {
        // console.log("USERSER", user)
        const checkProjectUserDetails = await Project.findOne({
            name,
            users:{
                $in:[user._id]
            }
        })
        console.log("YOOOOOOO", checkProjectUserDetails)
        if(!checkProjectUserDetails){
            return {
                message: false,
            }
        }
        return {
            message: true,
            id: checkProjectUserDetails._id
        }
    } catch (error) {
        console.log(error)
    }
}

export const getProjectFromName = async (name: string) => {
    try {
        const projectDetails = await Project.findOne({ name });
        
        if (!projectDetails) {
            return { message: "Not Found" };
        }

        // Using Promise.all to resolve the mapped promises
        const emails = await Promise.all(
            projectDetails.users.map(async (userId) => {
                console.log("Fetching user:", userId);
                const user = await User.findOne({ _id: userId });
                return user?.email || "Unknown Email";
            })
        );

        return emails;
    } catch (error) {
        console.error("Error fetching project:", error);
        return { message: "Internal Server Error" };
    }
};


export const updateFileTreeService = async (projectId:string, fileTree: Object)=>{
  try {
   const updateFileTreeResult = await Project.findOneAndUpdate({_id: projectId}, {
      fileTree
    })
   if(!updateFileTreeResult){
      return {
        message: updateFileTreeResult
      }
    }
   return {
        message: updateFileTreeResult
      }
  } catch (error) {
   console.log(error) 
  }
}

export const getFileTreeService = async (projectId:string)=>{
  try {
   const getFileTreeResult = await Project.findOne({_id: projectId}).select('fileTree')
   if(!getFileTreeResult){
      return {
        message: getFileTreeResult
      }
    }
   return {
        message: getFileTreeResult
      }
  } catch (error) {
   console.log(error) 
  }
}
