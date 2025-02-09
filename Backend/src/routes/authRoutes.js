import express from 'express'
import {connectDatabase} from  '../config/database.js'
import bcrypt from 'bcrypt'


const router = express.Router()


//to register students 
router.post('/registerStudent', async (req,res) => {
    const{studentId, studentName, studentEmail, studentAddress, studentDOB, studentPassword}=req.body;
    console.log(studentName)
    try{
        const db=await connectDatabase()
        console.log("Database connected successfully!");

        const [rows]=await db.query('SELECT * FROM student WHERE Student_Email=?',[studentEmail])
        if(rows.length>0){
            return res.json({message:"Student with this email already exists"})
        }
        
        const hashPassword= await bcrypt.hash(studentPassword,10)

        await db.query("INSERT INTO student (Student_Id,Student_Name,Student_Address,Student_Email,Student_DOB,Password) VALUES (?,?,?,?,?,?)",
            [studentId,studentName,studentAddress,studentEmail,studentDOB,studentPassword])
        res.status(201).json({message:"Student Added successfully"})
    }catch(err){
        res.status(500).json(err)

        console.log("Database connected FAILED!", err);
    }

})

export default router;

