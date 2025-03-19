
import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()


router.post('/registerTeacher', async (req, res) => {

    const { teacherId, teacherName, teacherEmail, teacherAddress, teacherDOB, teacherGender, teacherPassword } = req.body;

    try {
        const db = await connectDatabase()
        console.log("Database connected successfully!");
        const [rows] = await db.query('SELECT * FROM teacher WHERE Teacher_Email=?', [teacherEmail])
        if (rows.length > 0) {
            return res.status(409).json({ message: "Teacher with this email already exists" })
        }
        const hashPassword = await bcrypt.hash(teacherPassword, 10)
        await db.query("INSERT INTO teacher (Teacher_id,Teacher_Name,Teacher_Address,Teacher_DOB,Teacher_Email,Teacher_Gender,Password) VALUES (?,?,?,?,?,?,?)",
            [teacherId, teacherName, teacherAddress, teacherDOB, teacherEmail, teacherGender, hashPassword])
        res.status(201).json({ message: "Teacher Added successfully" })
    } catch (err) {
        res.status(500).json(err)

        console.log("Database connected FAILED!", err);
    }

})

router.get('/getTeacherDetail', async (req, res) => {
    try {
        console.log("Got the teachers ")
        const { userId, userRole } = req.query
        const db = await connectDatabase()
        let classes = [];
        if (userRole === 'admin') {
            const [result] = await db.query(`SELECT 
                                            t.Teacher_id,
                                            t.Teacher_Name,
                                            COALESCE(ta.Module_id, 'Not Assigned') AS Module_id,
                                            COALESCE(GROUP_CONCAT(DISTINCT ta.Course_id SEPARATOR ', '), 'Not Assigned') AS Courses,
                                            COALESCE(GROUP_CONCAT(DISTINCT sa.Section_id SEPARATOR ', '), 'Not Assigned') AS Sections
                                        FROM Teacher t
                                        LEFT JOIN Teacher_Association ta ON t.Teacher_id = ta.Teacher_id
                                        LEFT JOIN Section_Association sa ON t.Teacher_id = sa.Teacher_id
                                        GROUP BY t.Teacher_id, t.Teacher_Name, ta.Module_id`)

            classes = result
        }
        else if (userRole === 'student') {
            const [result] = await db.query(`SELECT DISTINCT 
                                                t.Teacher_id,
                                                t.Teacher_Name,
                                                t.Teacher_Email,
                                                t.Teacher_Gender,
                                                sec.Section_id
                                            FROM Student_Association sa
                                            JOIN Section_Association sec ON sa.Section_id = sec.Section_id
                                            JOIN Teacher_Association ta ON sec.Teacher_id = ta.Teacher_id
                                            JOIN Teacher t ON ta.Teacher_id = t.Teacher_id
                                            WHERE sa.Student_Id = ?`,[userId])
            classes = result
        }
        else {
            res.status(500).json({ success: false, message: "Wrong" });
        }
        console.log("Got the teachers ")
        res.status(200).json(classes)
    } catch (err) {
        console.error("Overall Class js error:", err);
        res.status(500).json({ success: false, message: "Failed to get teachers" });
    }
})
export default router