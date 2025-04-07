
import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()
router.get('/getSection', async (req, res) => {
    try {
        console.log("Got the get sections ")
        const db = await connectDatabase()
        const [section] = await db.query(`SELECT s.Section_id, COUNT(DISTINCT sta.Student_Id) AS Total_Students, COALESCE(GROUP_CONCAT(DISTINCT sa.Module_id SEPARATOR ', '), 'Not Assigned') AS Modules, 
            COALESCE(GROUP_CONCAT(DISTINCT sa.Academic_Year_id SEPARATOR ', '), 'Not Assigned') AS Academic_Years, 
            COALESCE(GROUP_CONCAT(DISTINCT sa.Course_id SEPARATOR ', '), 'Not Assigned') AS Courses FROM section s 
            LEFT JOIN section_association sa ON s.Section_id = sa.Section_id LEFT JOIN student_association sta ON s.Section_id = sta.Section_id 
            GROUP BY s.Section_id`)
        res.status(200).json(section)
    } catch (error) {
        console.error("Overall Class js error:", error);
        res.status(500).json({ success: false, message: "Failed to get section" });
    }
})
router.post('/addSection', async (req, res) => {
    try {
        const { name, Year, Course, modules } = req.body
        console.log("successfully in add sections !");

        console.log(name, Year, Course, modules)
        const Section_id = name
        const db = await connectDatabase()
        console.log("Database connected successfully in add sections !");
        const [existingSection] = await db.query("SELECT * FROM section WHERE Section_id = ?", [Section_id]);

        if (existingSection.length > 0) {
            return res.json({
                success: false,
                message: "Section with this ID already exists",
            })
        }

        await db.execute("INSERT INTO `section` (`Section_id`) VALUES (?)", [Section_id])
        const values = modules.map(sa => `('${sa.moduleId}', ${Year},'${Course}', ${sa.teacherId}, '${Section_id}')`).join(",")
        console.log(values)
        if (values.length > 0) {
            await db.execute(`INSERT INTO section_association (Module_id, Academic_Year_id, Course_id, Teacher_id, Section_id) VALUES ${values}`)
        }
        console.log("Sucessfully added the sections associations")
        res.json({
            success: true,
            message: "Added the section sucessfully",
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