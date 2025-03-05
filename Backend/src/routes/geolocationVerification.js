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

export default router