
import express from 'express'
import { connectDatabase } from '../config/database.js'
import bcrypt from 'bcrypt'

const router = express.Router()


//to register students 
router.post('/registerStudent', async (req, res) => {
    const { studentId, studentName, studentEmail, studentAddress, studentDOB, studentPassword, section,studentGender } = req.body;
    console.log(section,studentGender)
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
        const [section_association]= await db.query("SELECT * FROM `section_association` WHERE section_id=?",[section])
        const values = section_association.map(sa => `('${sa.Module_id}', ${sa.Academic_Year_id}, '${sa.Course_id}', '${sa.Section_id}', '${studentId}')`).join(",")

        console.log(values)
        if (values.length > 0) {
            await db.query(`INSERT INTO student_association (Module_id, Academic_Year_id, Course_id, Section_id, Student_Id) VALUES ${values}`);
        }
        console.log("Sucessfully  student associations")

        res.status(201).json({ message: "Student Added successfully" })
    } catch (err) {
        res.status(500).json(err)

        console.log("Database connected FAILED!", err);
    }

})

router.get('/getStudentDetail', async (req, res) => {
    try {
        const { userId, userRole, section_id } = req.query
        console.log("The user role in studenty is:",userRole)
        console.log("Got the student details and the student section is :",section_id)

        const db = await connectDatabase()
        let students = []
        if (userRole === 'admin') {
            const [result] = await db.query(`SELECT 
                                                s.Student_Id,
                                                s.Student_Name,
                                                COALESCE(GROUP_CONCAT(DISTINCT sa.Module_id SEPARATOR ', '), 'Not Assigned') AS Modules,
                                                COALESCE(GROUP_CONCAT(DISTINCT sa.Academic_Year_id SEPARATOR ', '), 'Not Assigned') AS Academic_Years,
                                                COALESCE(GROUP_CONCAT(DISTINCT sa.Course_id SEPARATOR ', '), 'Not Assigned') AS Courses,
                                                COALESCE(GROUP_CONCAT(DISTINCT sa.Section_id SEPARATOR ', '), 'Not Assigned') AS section_id
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
                                                COALESCE(GROUP_CONCAT(DISTINCT sa.Module_id SEPARATOR ', '), 'Not Assigned') AS Modules,
                                                COALESCE(GROUP_CONCAT(DISTINCT sa.Academic_Year_id SEPARATOR ', '), 'Not Assigned') AS Academic_Years,
                                                COALESCE(GROUP_CONCAT(DISTINCT sa.Course_id SEPARATOR ', '), 'Not Assigned') AS Courses,
                                                COALESCE(GROUP_CONCAT(DISTINCT sa.Section_id SEPARATOR ', '), 'Not Assigned') AS section_id
                                            FROM Student s
                                            LEFT JOIN student_association  sa ON s.Student_Id = sa.Student_Id
                                            WHERE sa.Section_id=?
                                            GROUP BY s.Student_Id, s.Student_Name`,[section_id])
            students = result
        }
        else {
            res.status(500).json({ success: false, message: "Wrong" });
        }
        console.log("students",students)
        console.log("Got the students ")
        res.status(200).json(students)
    } catch (err) {
        console.error("Overall Class js error:", err);
        res.status(500).json({ success: false, message: "Failed to get teachers" });
    }
})
export default router