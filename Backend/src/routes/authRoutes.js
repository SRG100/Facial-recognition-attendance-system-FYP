import express from 'express'
import {connectDatabase} from  '../config/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


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
            return res.status(409).json({message:"Student with this email already exists"})
        }
        
        const hashPassword= await bcrypt.hash(studentPassword,10)

        await db.query("INSERT INTO student (Student_Id,Student_Name,Student_Address,Student_Email,Student_DOB,Password) VALUES (?,?,?,?,?,?)",
            [studentId,studentName,studentAddress,studentEmail,studentDOB,hashPassword])
        res.status(201).json({message:"Student Added successfully"})
    }catch(err){
        res.status(500).json(err)

        console.log("Database connected FAILED!", err);
    }

})

//to register students 
router.post('/login', async (req,res) => {
    const{ email, password}=req.body;
    
    console.log('the email is ',email)
    try{
        const db=await connectDatabase()
        console.log("Database connected successfully!");
        console.log("Database connected successfully!");
        const [rows]=await db.query('SELECT * FROM student WHERE Student_Email=?',[email])
        if(rows.length===0){
            console.log("User with this email doesn't exists");
            return res.status(404).json({message:"User with this email doesn't exists"})
        }
        const isMatch=await bcrypt.compare(password,rows[0].Password)
        if(!isMatch){
            console.log("Wrong Password");

            return res.status(401).json({message:"Wrong Password"})
            
        }
        console.log("Login ok");
        const token=jwt.sign({id:rows[0].studentId}
            
            ,process.env.JWT_KEY, 
            {expiresIn:'1h'})
        
        console.log("Now check face id");

        const Faceid=rows[0].Faceid;
        console.log(Faceid)
        if(Faceid===null || Faceid===undefined){
            console.log("No face id");
            return res.status(200).json({ message: "Face ID is not registered" })

        }
        return res.status(201).json({ message: "Login sucessful" })

        
    }catch(err){
        res.status(500).json(err)
        console.log("Database connected FAILED!", err);
    }

})

export default router;

