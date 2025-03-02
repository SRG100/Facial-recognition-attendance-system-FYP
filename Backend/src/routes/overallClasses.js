import express from 'express'
import { connectDatabase } from '../config/database.js'
const app = express();


const router = express.Router()

router.get('/scheduledClass', async (req, res) => {
    try {
        console.log("got to get the scheduled classes api")

        
        const { userId, userRole } = req.query
        const db = await connectDatabase()
        console.log("the user id is:", userId)
        console.log("the user role is:", userRole)
        let classes=[];
        // if (userRole === 'student') {
            const [result] =  await db.query(`SELECT s.Student_Id, s.Student_Name, sec.Section_Id, c.Class_Id, m.Module_Name,  c.Class_Start_Time, c.Class_End_Time, c.Class_Type, 
                    c.Class_Day, 
                    t.Teacher_Id, 
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
            classes=result
        // }
        // else if (userRole === 'teacher') {
        //     const [result] = await db.query(` const [classes] = await db.query("SELECT s.Student_Id, s.Student_Name, sec.Section_Id, c.Class_Id, m.Module_Name,  c.Class_Start_Time, c.Class_End_Time, 
        //             c.Class_Day, 
        //             t.Teacher_Id, 
        //             t.Teacher_Name
        //         FROM student s
        //         JOIN student_association sa ON s.Student_Id = sa.Student_Id
        //         JOIN section sec ON sa.Section_Id = sec.Section_Id
        //         JOIN section_association sec_a ON sec.Section_Id = sec_a.Section_Id
        //         JOIN class_association ca ON sec_a.Section_Id = ca.Section_Id
        //         JOIN class c ON ca.Class_Id = c.Class_Id
        //         JOIN module m ON ca.Module_Id = m.Module_Id
        //         JOIN teacher_association ta ON ca.Teacher_Id = ta.Teacher_Id
        //         JOIN teacher t ON ta.Teacher_Id = t.Teacher_Id
        //         WHERE s.Student_Id = ?`, [userId])
        //     classes=result
        // }

                console.log("The scheduled class are:",classes)
        res.status(200).json(classes);



    } catch (err) {
        console.error("Authorization error:", err);
        res.status(500).json({ success: false, message: "Authorization Failed" });
    }
})

export default router