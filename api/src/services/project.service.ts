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

export const addUser = async(name: string, email: string, user:{_id: string, email:string})=>{
    try {
        const userDetails = await User.findOne({
            email
        })
        if(!userDetails){
            return {
                message: "User not found"
            }
        }
        const addUserDetails = await Project.updateOne({
            name: name,
            users:[
                user._id
            ]
        },{
            $push:{
                users: userDetails._id
            }
        })
        if(!addUserDetails){
            return {
                message: "Error while adding another user"
            }
        }
        return {
            message: addUser
        }
    } catch (error: any) {
        return {
            message: error.message
        }
    }
}