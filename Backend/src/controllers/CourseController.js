
import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()

router.get('/getCourseDetails', async (req, res) => {
    try {
        console.log("Got the courses ")
        const db = await connectDatabase()
        const [courses] = await db.query(`SELECT * from course`)

        console.log("Got the courses ")
        res.status(200).json(courses)
    } catch (err) {
        console.error("Overall Class js error:", err);
        res.status(500).json({ success: false, message: "Failed to get teachers" });
    }
})
export default router