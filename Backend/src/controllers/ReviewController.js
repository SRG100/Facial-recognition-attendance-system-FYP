import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()

router.post('/studentReview', async (req, res) => {

    try {
        const { Id, userId, rating, Suggestions } = req.body
        const Student_id = Id

        const db = await connectDatabase()
        console.log("Database connected successfully in student review!");

        const [rows] = await db.query('SELECT DISTINCT sa.* FROM  section_association seca JOIN student_association sa ON seca.Module_id = sa.Module_id WHERE seca.Teacher_id=? and sa.student_id=?', [userId, Student_id])
        console.log(rows)
        const Module_id = rows[0].Module_id
        const Academic_Year_id = rows[0].Academic_Year_id
        const Course_id = rows[0].Course_id
        const Section_id = rows[0].Section_id
        console.log(Section_id, Course_id, Academic_Year_id, Module_id)

        const [result] = await db.execute(
            "INSERT INTO `Student_Review` ( `Rating`, `Suggestions`) VALUES ( ?, ?)",
            [rating, Suggestions]
        )

        const Student_review_id = result.insertId
        await db.execute("INSERT INTO student_review_associatioin (Module_id, Academic_Year_id, Course_id, Reviewed_By_Teacher_id,Section_id,Student_Id, Student_review_Id) VALUES ( ?, ?,?,?, ?, ?,?)", [Module_id, Academic_Year_id, Course_id, userId, Section_id, Student_id, Student_review_id])
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
        console.log(Id, userId, rating, Suggestions)
        const Teacher_id = Id
        const db = await connectDatabase()
        console.log("Database connected successfully in teacher review!");

        const [rows] = await db.query(`SELECT DISTINCT ta.*
                    FROM teacher_association ta
                    JOIN student_association sa ON ta.Course_id = sa.Course_id
                    WHERE sa.Student_Id = ? AND ta.Teacher_id = ?
                    `, [userId, Teacher_id])
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

router.get('/getReviewDetails', async (req, res) => {
    try {
        const db = await connectDatabase()
        console.log("Database connected successfully in get review details");
        const { Id, ReviewOf } = req.query
        console.log(Id, ReviewOf)
        let avgRatings, totalReviews, eachCount, review
        if (ReviewOf == "Student") {
            console.log("It is an student")
            const [reviews] = await db.execute("Select sr.*, s.Student_Name, s.Student_Email ,t.Teacher_Name, t.Teacher_Email from student_review sr JOIN student_review_associatioin sa on sr.student_review_Id= sa.student_review_Id JOIN student s on sa.student_id=s.student_id JOIN teacher t on sa.reviewed_by_teacher_id =t.teacher_id where s.student_id= ?", [Id])
            review = reviews
            console.log(review, reviews)
            const [total_reviews] = await db.execute("SELECT COUNT(*) AS total_reviews FROM student_review sr  JOIN student_review_associatioin sa on sr.student_review_Id= sa.student_review_Id where sa.student_id= ?", [Id])
            const [average_rating] = await db.execute(
                "SELECT AVG(sr.Rating) AS AVGreviews FROM student_review sr JOIN student_review_associatioin sa ON sr.student_review_Id = sa.student_review_Id WHERE sa.student_id = ?",
                [Id]
            )
            const [total_count_each] = await db.execute(
                `SELECT sr.Rating, COUNT(*) AS count FROM student_review sr 
                JOIN student_review_associatioin sa ON sr.student_review_Id = sa.student_review_Id 
                WHERE sa.student_id = ?
                GROUP BY sr.Rating 
                ORDER BY sr.Rating ASC`, [Id])
            totalReviews = total_reviews[0].total_reviews
            eachCount = total_count_each
            avgRatings = average_rating[0].AVGreviews

        } else if (ReviewOf === "Teacher") {
            console.log("It is an teacher")
            const [reviews] = await db.execute(`SELECT tr.*, t.Teacher_Name, t.Teacher_Email, s.student_name, s.student_email FROM teacher_review tr JOIN teacher_review_association ta ON tr.teacher_review_Id = ta.teacher_review_Id JOIN teacher t ON ta.teacher_id = t.teacher_id JOIN student s ON ta.Review_by_student_id=s.student_id WHERE t.teacher_id = ?`, [Id])
            review = reviews
            const [total_reviews] = await db.execute( `SELECT COUNT(*) AS total_reviews FROM teacher_review tr JOIN teacher_review_association ta ON tr.teacher_review_Id = ta.teacher_review_Id WHERE ta.teacher_id = ?`, [Id])
            const [average_rating] = await db.execute(
                'SELECT AVG(tr.Rating) AS AVGreviews FROM teacher_review tr JOIN teacher_review_association ta ON tr.teacher_review_Id = ta.teacher_review_Id WHERE ta.teacher_id = ?',[Id]
            )
            const [total_count_each] = await db.execute(
                `SELECT tr.Rating, COUNT(*) AS count FROM teacher_review tr JOIN teacher_review_association ta ON tr.teacher_review_Id = ta.teacher_review_Id WHERE ta.teacher_id = ? GROUP BY tr.Rating ORDER BY tr.Rating ASC`, [Id])
            totalReviews = total_reviews[0].total_reviews
            eachCount = total_count_each
            avgRatings = average_rating[0].AVGreviews
            console.log(totalReviews,eachCount,avgRatings)
        } else {
            console.log("It is a module")
            const [reviews] = await db.execute(
                `SELECT mr.*, m.Module_Name, s.Student_Name, s.Student_Email FROM module_review mr JOIN module_review_association ma ON mr.module_review_Id = ma.module_review_Id JOIN module m ON ma.module_id = m.module_id JOIN student s ON ma.Reviewed_by_student_id = s.student_id WHERE m.module_id = ?`, [Id])
            review = reviews
            const [total_reviews] = await db.execute( `SELECT COUNT(*) AS total_reviews FROM module_review mr  JOIN module_review_association ma ON mr.module_review_Id = ma.module_review_Id WHERE ma.module_id = ?`, [Id])
            const [average_rating] = await db.execute( `SELECT AVG(mr.Rating) AS AVGreviews FROM module_review mr JOIN module_review_association ma ON mr.module_review_Id = ma.module_review_Id WHERE ma.module_id =?`,[Id])
            const [total_count_each] = await db.execute(
                `SELECT mr.Rating, COUNT(*) AS count FROM module_review mr JOIN module_review_association ma ON mr.module_review_Id = ma.module_review_Id WHERE ma.module_id = ? GROUP BY mr.Rating ORDER BY mr.Rating ASC`, [Id])
            totalReviews = total_reviews[0].total_reviews
            eachCount = total_count_each
            avgRatings = average_rating[0].AVGreviews
        }
        res.json({
            review,
            totalReviews,
            avgRatings,
            eachCount
        })
    } catch (err) {
        console.log("error found:", err)
    }

})
export default router