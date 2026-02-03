import express from 'express';
import { Router } from 'express';
import mongoose from 'mongoose';
export const router=Router();
import { Student } from '../models/students.models.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// http://localhost:3000?page=1&limit=5

//Get all students
router.get('/', async(req,res)=>{
  try{
    const page=parseInt(req.query.page) || 1;
    const limit=parseInt(req.query.limit) || 3;
    const skip=(page-1)*limit;
    const search = req.query.search || null;
    let query={};
    if(search)
    {
      query={
        $or: [
        {first_name:{ $regex : search, $options: 'i'}},
        {last_name:{ $regex : search, $options: 'i'}}
      ]
      }   
    }
    const total= await Student.countDocuments(query);
    const students=await Student.find(query).skip(skip).limit(limit);
    res.json({
      total,
      page,
      limit,
      totalPage: Math.ceil(total/limit),
      students
    });
  }catch(err)
  {
    res.status(500).json({message:err.message});
  }
});

//Get a single student
router.get('/:id', async(req,res)=>{
  try{
    const id=req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid student ID' });
  }
    const student=await Student.findById(req.params.id);
    if(!student)
      return res.status(404).json({message:"Student not found"});
    return res.json(student);

  }catch(err)
  {
    return res.status(500).json({message:err.message});
  }
});




//Image Upload Syntax
const storage=multer.diskStorage({
  destination: function(req,file,cb){
    cb(null,'./uploads');
  },
  filename: function(req,file,cb){
    const newFilename=Date.now()+ path.extname(file.originalname);
    cb(null,newFilename);
  }
})
const fileFilter=(req,file,cb)=>{
  if(file.mimetype.startsWith('image/'))
    cb(null,true);
  else
    cb(new Error('Only Images are allowed!'),false);
}
const upload=multer({
  storage:storage,
  limit:{
    fileSize: 1024*1024*3
  },
  fileFilter:fileFilter,
})
//Add new Student
router.post('/',upload.single('profile_pic'),async(req,res)=>{
  try{
    const student=new Student(req.body);
    if(req.file)
    {
      student.profile_pic=req.file.filename;
    }
    const newStudent=await student.save();
    res.status(201).json(newStudent);
  }catch(err)
  {
    res.status(400).json({message:err.message});
  }
});


//Update a Student
router.put('/:id',upload.single('profile_pic'),async(req,res)=>{
  try{
    const id=req.params.id;
    const student=await Student.findById(id);
    if(!student) 
      {
        if(req.file.filename)
        {
          const filePath=path.join('./uploads',req.file.filename);
          fs.unlink(filePath,(err)=>{
            console.log('Failed to Delete image', err);
          });
        }
        return res.status(404).json({message:'Student not found'});
      }
    if(req.file)
    {
      if(student.profile_pic)
        {
          const filePath=path.join('./uploads',student.profile_pic);
          fs.unlink(filePath,(err)=>{
            console.log('Failed to Delete old image', err);
          });
        }
        req.body.profile_pic=req.file.filename; 
    }
    
    const updatedStudent= await Student.findByIdAndUpdate(id,req.body,{ new: true });
    res.status(201).json(updatedStudent);

  }catch(err)
  {
    res.status(400).json({message:err.message});
  }
});


//Delete a Student
router.delete('/:id', async(req,res)=>{
  try{
    const id=req.params.id;
    const student= await Student.findByIdAndDelete(id,req.body);
    if(!student)
      res.status(404).json({message:"Student not found"});
    if(student.profile_pic)
    {
      const filePath=path.join('./uploads',student.profile_pic);
      fs.unlink(filePath,(err)=>
      {
        if(err) console.log('Failed to Delete:', err);
      });
    }
    res.status(201).json({message:"Student deleted"});

  }catch(err)
  {
    res.status(500).json({message:err.message});
  }
});

