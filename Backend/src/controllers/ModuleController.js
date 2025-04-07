
import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()




router.get('/getModulesDetails', async (req, res) => {
    try {
        console.log("Got the modules ")
        const { userId, userRole } = req.query
        const db = await connectDatabase()
        let modules = []
        if (userRole === 'admin' || userRole === "teacher") {
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
            return res.status(500).json({ success: false, message: "Error ehile getting the modules" });
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

router.post('/addModules', async (req, res) => {
    try {
        const { moduleId, moduleName, moduleDetails, moduleCredit, year, courses } = req.body
        console.log("successfully in add moduels !", [moduleId, moduleName, moduleDetails, moduleCredit, year, courses])
        const db = await connectDatabase()
        const [existingModule] = await db.query("SELECT * FROM module WHERE Module_id = ?", [moduleId]);

        if (existingModule.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Module with this ID already exists",
            })
        }
        await db.query("INSERT INTO `module` (`Module_id`, `Module_Name`, `Module_details`, `Module_Credits`) VALUES (?, ?, ?, ?)", [moduleId, moduleName, moduleDetails, moduleCredit])
        const values = courses.map(c => `('${c}', '${moduleId}','${year}')`).join(",")
        console.log(values)
        if (values.length > 0) {
            await db.execute(`INSERT INTO module_course_academic ( Course_id, Module_id, Academic_Year_id) VALUES ${values}`)
        }
        console.log("Sucessfully added the modules and its association")
        res.json({
            success: true,
            message: "Sucessfully added the module",
        })
    }
    catch (e) {
        console.log("error found:", e)
        res.json({
            success: false,
            message: "Error occured while adding section",
        })
    }
})
export default router