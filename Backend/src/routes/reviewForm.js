import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router() 

router.post('/studentReview', async (req, res) => {

    try {
        const { Id, userId, rating, Suggestions } = req.body
        const Student_id=Id

        const db = await connectDatabase()
        console.log("Database connected successfully in student review!");

        const [rows] = await db.query('SELECT DISTINCT sa.* FROM  section_association seca JOIN student_association sa ON seca.Module_id = sa.Module_id WHERE seca.Teacher_id=? and sa.student_id=?', [userId,Student_id])
        console.log(rows)
        const Module_id = rows[0].Module_id
        const Academic_Year_id = rows[0].Academic_Year_id
        const Course_id = rows[0].Course_id
        const Section_id = rows[0].Section_id
        console.log(Section_id,Course_id,Academic_Year_id,Module_id)

        const [result] = await db.execute(
            "INSERT INTO `Student_Review` ( `Rating`, `Suggestions`) VALUES ( ?, ?)",
            [rating, Suggestions]
        )

        const Student_review_id = result.insertId
        await db.execute("INSERT INTO student_review_association (Module_id, Academic_Year_id, Course_id, Class_id Reviewed_By_Teacher_id,Section_id,Student_Id, Student_review_Id) VALUES (?, ?, ?,?,?, ?, ?,?)", [Module_id, Academic_Year_id, Course_id, userId, Section_id, Student_id, Student_review_id])
        console.log("Sucessfully reviewd the student")
        res.json({
            success: true,
            message: "Reviewed the student",
            verified: true,
        })

    }
    catch (e) {
        console.log("error found:", e)
    }
})

router.post('/moduleReview', async (req, res) => {
    try {
        const { Id, userId, rating, suggestions } = req.body
        console.log(Id, userId, rating, suggestions)
        const Module_id = Id
        const db = await connectDatabase()
        console.log("Database connected successfully in module review!");
        
        const [rows] = await db.query('SELECT DISTINCT mca.* FROM  module_course_academic mca JOIN student_association sa ON mca.Course_id = sa.Course_id WHERE mca.Module_id=? and sa.student_id=?  ', [Module_id, userId])
        console.log(rows)
        const Academic_Year_id = rows[0].Academic_Year_id
        const Course_id = rows[0].Course_id

        const [result] = await db.execute(
            "INSERT INTO `module_review` ( `Rating`, `Suggestions`) VALUES ( ?, ?)",
            [rating, suggestions]
        )

        const Module_review_id = result.insertId
        await db.execute("INSERT INTO `module_review_association` (`Module_id`, `Academic_Year_id`, `Course_id`, `Module_review_id`, `Reviewed_By_Student_Id`) VALUES (?, ?, ?, ?, ?)", [Module_id, Academic_Year_id, Course_id, Module_review_id, userId])
        console.log("Sucessfully reviewd the module")
        res.json({
            success: true,
            message: "Reviewed the module",
            verified: true,
        });

    }
    catch (e) {
        console.log("error found:", e)
    }
})

router.post('/teacherReview', async (req, res) => {
    try {
        const { Id, userId, rating, Suggestions } = req.body
        console.log(Id, userId, rating, Suggestions )
        const Teacher_id = Id
        const db = await connectDatabase()
        console.log("Database connected successfully in teacher review!");

        const [rows] = await db.query(`SELECT DISTINCT ta.*
                    FROM teacher_association ta
                    JOIN student_association sa ON ta.Course_id = sa.Course_id
                    WHERE sa.Student_Id = ? AND ta.Teacher_id = ?
                    `, [userId,Teacher_id])
        console.log(rows)
        const Module_id = rows[0].Module_id
        const Academic_Year_id = rows[0].Academic_Year_id
        const Course_id = rows[0].Course_id

        const [result] = await db.execute(
            "INSERT INTO `teacher_review` ( `Rating`, `Suggestions`) VALUES ( ?, ?)",
            [rating, Suggestions]
        )

        const Teacher_review_id = result.insertId
        await db.execute("INSERT INTO `teacher_review_association` (`Module_id`, `Academic_Year_id`, `Course_id`, `Teacher_id`, `Teacher_review_id`,`review_by_Student_id`) VALUES (?, ?, ?, ?,?, ?)", [Module_id, Academic_Year_id, Course_id, Teacher_id, Teacher_review_id, userId])
        console.log("Sucessfully reviewd the teacher")
        res.json({
            success: true,
            message: "Reviewed the teacher",
            verified: true,
        });

    }
    catch (e) {
        console.log("error found:", e)
    }
})
export default router