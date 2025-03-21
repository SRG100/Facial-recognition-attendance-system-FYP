
import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()


//to register students 
router.post('/registerStudent', async (req, res) => {
    const { studentId, studentName, studentEmail, studentAddress, studentDOB, studentPassword } = req.body;
    console.log(studentName)
    try {
        const db = await connectDatabase()
        console.log("Database connected successfully!");


        const [rows] = await db.query('SELECT * FROM student WHERE Student_Email=?', [studentEmail])
        if (rows.length > 0) {
            return res.status(409).json({ message: "Student with this email already exists" })
        }

        const hashPassword = await bcrypt.hash(studentPassword, 10)

        await db.query("INSERT INTO student (Student_Id,Student_Name,Student_Address,Student_Email,Student_DOB,Password) VALUES (?,?,?,?,?,?)",
            [studentId, studentName, studentAddress, studentEmail, studentDOB, hashPassword])
        console.log("Sucessfully regiosterd student")
        res.status(201).json({ message: "Student Added successfully" })
    } catch (err) {
        res.status(500).json(err)

        console.log("Database connected FAILED!", err);
    }

})

router.get('/getStudentDetail', async (req, res) => {
    try {
        console.log("Got the teachers ")
        const { userId, userRole, section_id } = req.query
        const db = await connectDatabase()
        let students = []
        if (userRole === 'admin') {
            const [result] = await db.query(`SELECT 
                                                s.Student_Id,
                                                s.Student_Name,
                                                COALESCE(GROUP_CONCAT(DISTINCT sa.Module_id SEPARATOR ', '), 'Not Assigned') AS Modules,
                                                COALESCE(GROUP_CONCAT(DISTINCT sa.Academic_Year_id SEPARATOR ', '), 'Not Assigned') AS Academic_Years,
                                                COALESCE(GROUP_CONCAT(DISTINCT sa.Course_id SEPARATOR ', '), 'Not Assigned') AS Course,
                                                COALESCE(GROUP_CONCAT(DISTINCT sa.Section_id SEPARATOR ', '), 'Not Assigned') AS Section
                                            FROM Student s
                                            LEFT JOIN student_association  sa ON s.Student_Id = sa.Student_Id
                                            GROUP BY s.Student_Id, s.Student_Name;
                                            `)

            students = result
        }
        else if (userRole === 'teacher') {
            const [result] = await db.query(`SELECT 
                                        s.Student_Id,
                                        s.Student_Name,
                                        sa.Section_id,
                                        GROUP_CONCAT(DISTINCT sa.Module_id SEPARATOR ', ') AS Modules,
                                        GROUP_CONCAT(DISTINCT sa.Academic_Year_id SEPARATOR ', ') AS Academic_Years,
                                        GROUP_CONCAT(DISTINCT sa.Course_id SEPARATOR ', ') AS Courses
                                    FROM Student s
                                    LEFT JOIN Student_Association sa ON s.Student_Id = sa.Student_Id
                                    WHERE sa.Section_id=? `,[section_id])
            students = result
        }
        else {
            res.status(500).json({ success: false, message: "Wrong" });
        }
        console.log("Got the teachers ")
        res.status(200).json(students)
    } catch (err) {
        console.error("Overall Class js error:", err);
        res.status(500).json({ success: false, message: "Failed to get teachers" });
    }
})
export default router