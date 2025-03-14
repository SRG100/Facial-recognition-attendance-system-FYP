
import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()

router.post('/addModule', async (req, res) => {
    try {
        const { Module_id, Module_Name, Module_details, Module_Credits, Academic_Year_id, Course_id } = req.body
        const db = await connectDatabase()
        console.log( Module_id, Module_Name, Module_details, Module_Credits, Academic_Year_id, Course_id)
        console.log("Database connected successfully in add module';!");
        await db.execute(
            "INSERT INTO `module` (`Module_id`, `Module_Name`, `Module_details`, `Module_Credits`) VALUES (?, ?, ?, ?)",
            [Module_id, Module_Name, Module_details, Module_Credits]
        )
        await db.execute("INSERT INTO `module_course_academic` (`Module_id`, `Academic_Year_id`, `Course_id`) VALUES (?, ?, ?)", [Module_id, Academic_Year_id, Course_id])
        console.log("Sucessfully added the module.")
        res.json({
            success: true,
            message: "Added the module",
        })
    }
    catch (e) {
        console.log("error found:", e)
        res.json({
            success: false,
            message: "Error occured while adding module",
        })
    }
})
router.post('/addModuleAssociation', async (req, res) => {
    try {
        const { Module_id, Academic_Year_id, Course_id } = req.body
        const db = await connectDatabase()
        console.log( Module_id, Academic_Year_id, Course_id)
        console.log("Database connected successfully in add module associations!");
        await db.execute("INSERT INTO `module_course_academic` (`Module_id`, `Academic_Year_id`, `Course_id`) VALUES (?, ?, ?)", [Module_id, Academic_Year_id, Course_id])
        console.log("Sucessfully added the module association.")
        res.json({
            success: true,
            message: "Added the module associations",
        })
    }
    catch (e) {
        console.log("error found:", e)
        res.json({
            success: false,
            message: "Error occured while adding module associations",
        })
    }
})
router.post('/addSection', async (req, res) => {
    try {
        const { Section_id } = req.body
        const db = await connectDatabase()
        console.log("Database connected successfully in add sections !");
        await db.execute("INSERT INTO `section` (`Section_id`) VALUES (?)", [Section_id])
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
        const { Module_id,Academic_Year_id,Course_id,Teacher_id,Section_id } = req.body
        const db = await connectDatabase()
        console.log("Database connected successfully in add sections !");
        await db.execute("INSERT INTO `section_association` (`Module_id`, `Academic_Year_id`, `Course_id`, `Teacher_id`, `Section_id`) VALUES (?, ?, ?, ?, ?)", [Module_id,Academic_Year_id,Course_id,Teacher_id,Section_id ])
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