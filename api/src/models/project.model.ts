import {Schema, model} from 'mongoose'

const projectSchema = new Schema({
    name:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true
    },
    users:[
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    fileTree:{
      type: Object,
      default: {}
    }
})

export const Project = model("Project",projectSchema) 
