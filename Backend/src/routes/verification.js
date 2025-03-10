import express from 'express'
import { connectDatabase } from '../config/database.js'
const router = express.Router()

const calculateDistance = (studentLat, studentLon, teacherLat, teacherLon) => {
    const R = 6371e3; // Earth's radius in meters
    const studentLatRad = studentLat * Math.PI / 180;
    const teacherLatRad = teacherLat * Math.PI / 180;
    const deltaLat = (teacherLat - studentLat) * Math.PI / 180;
    const deltaLon = (teacherLon - studentLon) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(studentLatRad) * Math.cos(teacherLatRad) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    let distance = R * c
    return distance.toFixed(2)
}


router.get('/locationVerification', async(req,res)=>{
    try{
        const db = await connectDatabase()
        console.log("Database connected successfully!");
        console.log("got to get the location verification api")
        const { Class_Id, studentLongitude ,studentLatitude } = req.query
        console.log("The student longitufe is:",studentLongitude)
        const [result] = await db.query("SELECT * FROM `class` WHERE Class_id=?",[Class_Id])
        const teacherLongitude=result[0].Teacher_Longitude
        const teacherLatitude=result[0].Teacher_Latitude
        const distance =calculateDistance(studentLatitude,studentLongitude,teacherLatitude,teacherLongitude)
        console.log("The distance between teacher and student is:",distance)
        // if(distance<15)

        res.json({ 
            success: true, 
            message: "User is authorized", 
            verified:true,
        });

    }catch(err){
        console.error("Location verification error:",err);
        res.status(500).json({ success: false, message: "Location verificaton of student Failed" });
    }
})

router.get('/codeVerification', async(req,res)=>{
    try{
        const db = await connectDatabase()
        console.log("Database connected successfully!");
        console.log("got to the class code verification api")
        const { Class_Id, studentClassCode , Attendance_id } = req.query
        console.log("The class id got in code verfication is",Class_Id)
        console.log("The attendance  in code verfication is",Attendance_id)
        console.log("The student enterned code is",studentClassCode)
        const [result] = await db.query("SELECT * FROM `class` WHERE Class_id=?",[Class_Id])
        const autualClassCode=result[0].Class_Code
        console.log("The actual code is",autualClassCode)
        
        if(autualClassCode===studentClassCode){
            await db.query("UPDATE attendance SET Code = 1 WHERE attendance.Attendance_Id = ?",[Attendance_id])
            res.json({ 
                success: true, 
                message: "Code is incorrect", 
                codeVerified:true,
            })
            

        }
        else{
            res.json({ 
                success: true, 
                message: "Code is incorrect", 
                codeVerified:false,
            })
        }

    }catch(err){
        console.error("Location verification error:",err);
        res.status(500).json({ success: false, message: "Location verificaton of student Failed" });
    }
})

export default router