
import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()




router.get('/getModulesDetails', async (req, res) => {
    try {
        console.log("Got the modules ")
        const { userId, userRole } = req.query
        const db = await connectDatabase()
        let modules = []
        if (userRole === 'admin') {
            const [result] = await db.query(`SELECT * from module`)

            modules = result
        }
        else if (userRole === 'student') {
            const [result] = await db.query(`SELECT m.Module_id, m.Module_Name, m.Module_details, m.Module_Credits
            FROM student_association sa
            JOIN module m ON sa.Module_id = m.Module_id
            WHERE sa.Student_Id =?`,[userId])
            modules = result
        }
        else {
            res.status(500).json({ success: false, message: "Wrong" });
        }
        console.log("Got the modules ")
        res.status(200).json(modules)
    } catch (err) {
        console.error("Overall Class js error:", err);
        res.status(500).json({ success: false, message: "Failed to get teachers" });
    }
})
export default router