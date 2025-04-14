
import express from 'express'
import { connectDatabase } from '../config/database.js'
import bcrypt from 'bcrypt'

const router = express.Router()


router.post('/registerTeacher', async (req, res) => {

    const { teacherName, teacherEmail, teacherAddress, teacherDOB, teacherGender, teacherPassword, teacherModule } = req.body;

    try {
        const db = await connectDatabase()

        console.log("Database connected successfully in registyer teacher");
        const [maxTeacher] = await db.execute("SELECT MAX(teacher_id) as maxId FROM teacher")
        const teacherId = maxTeacher[0].maxId ? maxTeacher[0].maxId + 1 : 1

        const [rows] = await db.query('SELECT * FROM teacher WHERE Teacher_Email=?', [teacherEmail])
        if (rows.length > 0) {
            return res.json({ message: "Teacher with this email already exists" ,success:false})
        }
        const hashPassword = await bcrypt.hash(teacherPassword, 10)
        await db.query("INSERT INTO teacher (Teacher_id,Teacher_Name,Teacher_Address,Teacher_DOB,Teacher_Email,Teacher_Gender,Password) VALUES (?,?,?,?,?,?,?)",
            [teacherId, teacherName, teacherAddress, teacherDOB, teacherEmail, teacherGender, hashPassword])

        const [module_association] = await db.query("SELECT * FROM module_course_academic WHERE module_id=?", [teacherModule])
        const values = module_association.map(ma => `('${ma.Module_id}', ${ma.Academic_Year_id}, '${ma.Course_id}', '${teacherId}')`).join(",")

        console.log(values)
        if (values.length > 0) {
            await db.query(`INSERT INTO teacher_association (Module_id, Academic_Year_id, Course_id, Teacher_id) VALUES ${values}`);
        }

        res.status(201).json({ message: "Teacher Added successfully",success:true })
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
        if (userRole === 'admin' || userRole === 'teacher') {
            const [result] = await db.query(`SELECT 
                                            t.Teacher_id,
                                            t.Teacher_Name,
                                            COALESCE(ta.Module_id, 'Not Assigned') AS Module_id,
                                                COALESCE(m.Module_Name, 'Not Assigned') AS Module_Name,
                                            COALESCE(GROUP_CONCAT(DISTINCT ta.Course_id SEPARATOR ', '), 'Not Assigned') AS Courses,
                                            COALESCE(GROUP_CONCAT(DISTINCT sa.Section_id SEPARATOR ', '), 'Not Assigned') AS Sections
                                        FROM Teacher t
                                        LEFT JOIN Teacher_Association ta ON t.Teacher_id = ta.Teacher_id
                                        LEFT JOIN Module m ON ta.Module_id = m.Module_id
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
                                            WHERE sa.Student_Id = ?`, [userId])
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