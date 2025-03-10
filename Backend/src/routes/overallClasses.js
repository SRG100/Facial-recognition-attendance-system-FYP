import express from 'express'
import { connectDatabase } from '../config/database.js'
const app = express()


const router = express.Router()

router.get('/scheduledClass', async (req, res) => {
    try {
        const { userId, userRole } = req.query
        const db = await connectDatabase()
        let classes = [];
        if (userRole === 'student') {
            const [result] = await db.query(`SELECT s.Student_Id, s.Student_Name, sec.Section_Id, c.Class_Id, m.Module_Id, m.Module_Name,  
                c.Class_Start_Time, c.Class_End_Time, c.Class_Type, 
                sa.Academic_Year_id,sa.Course_id,
                    c.Class_Day, 
                    t.Teacher_Id, 
                    c.Class_Status,
                    t.Teacher_Name
                FROM student s
                JOIN student_association sa ON s.Student_Id = sa.Student_Id
                JOIN section sec ON sa.Section_Id = sec.Section_Id
                JOIN section_association sec_a ON sec.Section_Id = sec_a.Section_Id
                JOIN class_association ca ON sec_a.Section_Id = ca.Section_Id
                JOIN class c ON ca.Class_Id = c.Class_Id
                JOIN module m ON ca.Module_Id = m.Module_Id
                JOIN teacher_association ta ON ca.Teacher_Id = ta.Teacher_Id
                JOIN teacher t ON ta.Teacher_Id = t.Teacher_Id
                WHERE s.Student_Id = ?`, [userId])
            classes = result
        }
        else if (userRole === 'teacher') {
            const [result] = await db.query(`SELECT 
                                                t.Teacher_Id, 
                                                t.Teacher_Name, 
                                                sec.Section_Id, 
                                                c.Class_Id, 
                                                m.Module_Name,  
                                                c.Class_Start_Time, 
                                                c.Class_End_Time, 
                                                c.Class_Type, 
                                                c.Class_Status, 
                                                c.Class_Day
                                            FROM teacher t
                                            JOIN teacher_association ta ON t.Teacher_Id = ta.Teacher_Id
                                            JOIN class_association ca ON ta.Module_id = ca.Module_Id
                                            JOIN class c ON ca.Class_Id = c.Class_Id 
                                            JOIN section sec ON ca.Section_Id = sec.Section_Id  
                                            JOIN module m ON ca.Module_Id = m.Module_Id 
                                            WHERE t.Teacher_Id = ?`, [userId])

            classes = result
        } else {
            res.status(500).json({ success: false, message: "Wrong user" });
        }
        console.log("Got the scheduled classes")
        res.status(200).json(classes);

    } catch (err) {
        console.error("Overall Class js error:", err);
        res.status(500).json({ success: false, message: "Failed to get classes" });
    }
})
router.post('/startAttendance', async (req, res) => {
    try {
        // const { Class_Id, teacherLocation } = req.body;
        const { Class_Id , Section_Id ,teacherLocation} = req.body;
        console.log("teacher Location is:",teacherLocation)
        const teacherLongitude=teacherLocation.longitude
        const teacherLatitude=teacherLocation.latitude

        // console.log("Reached the start attendance by teacher and the class id is:", Class_Id,teacherLongitude, teacherLatitude)
        const db = await connectDatabase()
        console.log("Database connected successfully!")
        //generation of random number for the class code
        const randomNumber=Math.floor(Math.random()*10000)
        const Class_Code= String(Section_Id) + "-"+ String(Class_Id) + "-" + String(randomNumber) ;
        console.log("The class Code is:",Class_Code)

        await db.query("UPDATE class SET Class_Status = '1' , Teacher_Longitude = ?, Teacher_Latitude = ? ,Class_Code=? WHERE Class_id = ?", [teacherLongitude, teacherLatitude, Class_Code,Class_Id]);
        await db.query("UPDATE class SET Class_Status = '1',Class_Code=?  WHERE Class_id = ?", [Class_Code, Class_Id]);

        res.status(201).json({ message: "Class started sucessfully", classCode:Class_Code })
    } catch (err) {
        res.status(500).json(err)
        console.log("Error occurred", err);
    }
})

router.post('/markAttendance', async (req, res) => {
    try {
        const { Module_id,     
            Academic_Year_id,     
            Course_id, 
            Teacher_Id,     
            Section_Id,
            Class_Id,            
            Student_Id } = req.body;
        console.log(Class_Id)
        const Attendance_Id = String(Section_Id) + "_" + String(Class_Id) + "_" + String(Student_Id);
        const Attendance_Status = "Not Verified"
        const db = await connectDatabase()
        const Attendance_Date = new Date().toISOString().split('T')[0];
        const Attendance_Time = new Date().toTimeString().split(' ')[0];

        console.log("Database connected successfully!");
        await db.query(
            "INSERT INTO attendance (Attendance_Id, Attendance_Date, Attendance_Status, Attendance_Time) VALUES (?, ?, ?, ?)",
            [
                Attendance_Id,
                Attendance_Date,
                Attendance_Status,
                Attendance_Time
            ]
        )
        await db.query(
            "INSERT INTO attendance_association (Module_id, Academic_Year_id, Course_id, Teacher_id, Section_id, Class_id, Student_Id, Attendance_Id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                Module_id,     
                Academic_Year_id,     
                Course_id, 
                Teacher_Id,     
                Section_Id,
                Class_Id,            
                Student_Id,       
                Attendance_Id
            ]
        )
        res.status(201).json({ message: "Marked Attendance sucessfully", Attendance_Id:Attendance_Id })
    } catch (err) {
        res.status(500).json(err)
        console.log("Error occurred", err);
    }

})
export default router