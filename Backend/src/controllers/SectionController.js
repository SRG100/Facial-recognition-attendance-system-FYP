
import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()
router.get('/getSection', async (req, res) => {
    try{
        console.log("Got the sections ")
        const db = await connectDatabase()
        const [section] = await db.query(`SELECT * from Section`)
        res.status(200).json(section)
    }catch(error){
        console.error("Overall Class js error:", error);
        res.status(500).json({ success: false, message: "Failed to get section" });
    }
    

})
router.post('/addSection', async (req, res) => {
    try {
        const {name} = req.body
        const Section_id= name
        const db = await connectDatabase()
        console.log("Database connected successfully in add sections !");
        // const modules = await db.execute("Select module_id from module_course_academic where Academic_Year_id=? and Course_id =?", [Academic_Year_id, Course_id])
        await db.execute("INSERT INTO `section` (`Section_id`) VALUES (?)", [Section_id])
        // await db.execute("INSERT INTO `section_association` (`Module_id`, `Academic_Year_id`, `Course_id`, `Teacher_id`, `Section_id`) VALUES (?, ?, ?, ?, ?)", [Module_id, Academic_Year_id, Course_id, Teacher_id, Section_id])

        console.log("Sucessfully added the sections.")
        res.json({
            success: true,
            message: "Added the sections",
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
router.post('/addSectionAssociations', async (req, res) => {
    try {
        const { Module_id, Academic_Year_id, Course_id, Teacher_id, Section_id } = req.body
        const db = await connectDatabase()
        console.log("Database connected successfully in add sections !");
        console.log("Sucessfully added the sections.")
        res.json({
            success: true,
            message: "Added the sections",
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