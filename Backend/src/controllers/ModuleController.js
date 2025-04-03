
import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()




router.get('/getModulesDetails', async (req, res) => {
    try {
        console.log("Got the modules ")
        const { userId, userRole } = req.query
        const db = await connectDatabase()
        let modules = []
        if (userRole === 'admin' || userRole==="teacher") {
            const [result] = await db.query(`SELECT * from module`)

            modules = result
        }
        else if (userRole === 'student') {
            const [result] = await db.query(`SELECT m.Module_id, m.Module_Name, m.Module_details, m.Module_Credits
            FROM student_association sa
            JOIN module m ON sa.Module_id = m.Module_id
            WHERE sa.Student_Id =?`, [userId])
            modules = result
        }
        else {
          return  res.status(500).json({ success: false, message: "Wrong" });
        }
        console.log("Got the modules ")
         return res.status(200).json(modules)
    } catch (err) {
        console.error("Overall Class js error:", err);
        res.status(500).json({ success: false, message: "Failed to get teachers" });
    }
})

router.get('/getSpecificModules', async (req, res) => {
    try {
        console.log("Got the specific  modules ")
        const { Course, Year } = req.query
        const db = await connectDatabase()
        let modules = []
        const [result] = await db.query(`SELECT ta.*, t.teacher_name from teacher_association ta JOIN teacher t ON ta.teacher_id = t.teacher_id where ta.course_id=? and ta.academic_year_id = ?`, [Course, Year])
        const groupedModules = result.reduce((acc, row) => {
            const { Module_id, Academic_Year_id, Course_id, Teacher_id, teacher_name } = row;

            if (!acc[Module_id]) {
                acc[Module_id] = {
                    Module_id,
                    Academic_Year_id,
                    Course_id,
                    Teacher_id: [],
                    teacher_name: []
                };
            }

            acc[Module_id].Teacher_id.push(Teacher_id);
            acc[Module_id].teacher_name.push(teacher_name);

            return acc;
        }, {});
        modules = groupedModules
        res.status(200).json(modules)
    } catch (err) {
        console.error("Overall Class js error:", err);
        res.status(500).json({ success: false, message: "Failed to get teachers" });
    }
})
export default router