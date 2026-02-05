import express from 'express';
import { router as studentRoutes} from './routes/students.routes.js';
import { connectDb } from './config/database.js';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { auth } from './middleware/auth.js';
import { router as userRoutes } from './routes/users.routes.js';
const app=express();
connectDb();
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use('/uploads',express.static(path.join(import.meta.dirname,'uploads')));
app.use(cors());

app.use('/api/users',userRoutes);

app.use(auth);
app.use('/api/students',studentRoutes);
app.use((error,req,res,next)=>{
  if(error instanceof MulterError)
  {
    return res.status(400).send(`Image Error: ${error.message}:${error.code}`);
  }
  else if(error)
    return res.status(500).send(`Something went wrong: ${error.message}`);
  next();
})
app.listen(process.env.PORT,()=>{
  console.log('Server started');
})