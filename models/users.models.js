import mongoose, { Mongoose } from "mongoose";

const userSchema= new mongoose.Schema(
  {
    username:{
      type:String,
      require:true,
      unique:true
    },
    email:{
      type:String,
      require:true,
      unique:true
    },
    password:{
      type:String,
      require:true,
    },
    createdAt:{
      type:Date,
      default:Date.now
    },
  }
)


export const user=mongoose.model('User',userSchema);