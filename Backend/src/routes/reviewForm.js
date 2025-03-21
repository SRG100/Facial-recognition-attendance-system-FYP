import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()

router.post('/studentReview', async (req, res) => {
    
    try {
        const { Student_id,User_id, Rating, Suggestions } = req.body
        const db = await connectDatabase()
        console.log("Database connected successfully in student review!");
        const [rows] = await db.query('SELECT * FROM  student_association WHERE Student_id=?', [Student_id])
        console.log(rows)
        const Module_id = rows[0].Module_id 
        const Academic_Year_id = rows[0].Academic_Year_id
        const Course_id = rows[0].Course_id
        const Section_id = rows[0].Course_id

        const [result] = await db.execute(
            "INSERT INTO `Student_Review` ( `Rating`, `Suggestions`) VALUES ( ?, ?)",
            [Rating,Suggestions]
        )

        const Student_review_id = result.insertId
        await db.execute("INSERT INTO `student_review_association` (`Module_id`, `Academic_Year_id`, `Course_id`, `Reviewed_By_Teacher_id`,Section_id,Student_Id, `Student_review_Id`) VALUES (?, ?, ?,?,?, ?, ?)",[Module_id,Academic_Year_id,Course_id,User_id,Section_id,Student_id,Student_review_id])
        console.log("Sucessfully reviewd the student")
        res.json({ 
            success: true, 
            message: "Reviewed the student", 
            verified:true,
        })

    }
    catch (e) {
        console.log("error found:",e)
    }
})

router.post('/moduleReview', async (req, res) => {
    try {
        const { Module_id ,User_id, Rating, Suggestions } = req.body
        const db = await connectDatabase()
        console.log("Database connected successfully in module review!");
        const [rows] = await db.query('SELECT * FROM  module_course_academic WHERE Module_id=?', [Module_id])
        console.log(rows)
        const Academic_Year_id = rows[0].Academic_Year_id
        const Course_id = rows[0].Course_id

        const [result] = await db.execute(
            "INSERT INTO `module_review` ( `Rating`, `Suggestions`) VALUES ( ?, ?)",
            [Rating,Suggestions]
        )

        const Module_review_id = result.insertId
        await db.execute("INSERT INTO `module_review_association` (`Module_id`, `Academic_Year_id`, `Course_id`, `Module_review_id`, `Reviewed_By_Student_Id`) VALUES (?, ?, ?, ?, ?)",[Module_id,Academic_Year_id,Course_id,Module_review_id,User_id])
        console.log("Sucessfully reviewd the module")
        res.json({ 
            success: true, 
            message: "Reviewed the module", 
            verified:true,
        });

    }
    catch (e) {
        console.log("error found:",e)
    }
})

router.post('/teacherReview', async (req, res) => {
    try {
        const { Teacher_id, Rating, Suggestions,User_id } = req.body
        const db = await connectDatabase()
        console.log("Database connected successfully in teacher review!");
        const [rows] = await db.query('SELECT * FROM  teacher_association WHERE Teacher_id=?', [Teacher_id])
        console.log(rows)
        const Module_id = rows[0].Module_id 
        const Academic_Year_id = rows[0].Academic_Year_id
        const Course_id = rows[0].Course_id

        const [result] = await db.execute(
            "INSERT INTO `teacher_review` ( `Rating`, `Suggestions`) VALUES ( ?, ?)",
            [Rating,Suggestions]
        )

        const Teacher_review_id = result.insertId
        await db.execute("INSERT INTO `teacher_review_association` (`Module_id`, `Academic_Year_id`, `Course_id`, `Teacher_id`, `Teacher_review_id`,`review_by_Student_id	`) VALUES (?, ?, ?, ?,?, ?)",[Module_id,Academic_Year_id,Course_id,Teacher_id,Teacher_review_id, User_id])
        console.log("Sucessfully reviewd the teacher")
        res.json({ 
            success: true, 
            message: "Reviewed the teacher", 
            verified:true,
        });

    }
    catch (e) {
        console.log("error found:",e)
    }
})
export default router