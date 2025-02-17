import express from 'express'
import {connectDatabase} from  '../config/database.js'

const router = express.Router()

//to register student's face id
router.post('/registerFace', async (req,res) => {
    console.log("got to register face")

    const { image } = req.body;

    if (!image) {
        console.log("The image is not here")

        return res.status(400).json({ error: "No image provided" });
    }
    if(image){
        console.log("The image is here")
    }
    const{studentId, studentName, studentEmail, studentAddress, studentDOB, studentPassword}=req.body;
    try{
        const db=await connectDatabase()
        console.log("Database connected successfully!");
        console.log("got the image",image)
        if (!image) {
        return res.status(400).json({ error: "No image provided" });
    }

        // const [rows]=await db.query('SELECT * FROM student WHERE Student_Email=?',[studentEmail])
        // if(rows.length>0){
        //     return res.status(409).json({message:"Student with this email already exists"})
        // }
        

        // await db.query("INSERT INTO student (Student_Id,Student_Name,Student_Address,Student_Email,Student_DOB,Password) VALUES (?,?,?,?,?,?)",
        //     [studentId,studentName,studentAddress,studentEmail,studentDOB,])
        // res.status(201).json({message:"Student Added successfully"})
    }catch(err){
        res.status(500).json(err)

        console.log("Database connected FAILED! of face registration", err);
    }

})
export default router