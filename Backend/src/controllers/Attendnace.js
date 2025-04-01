
import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()

router.get('/getAttendnaceDetails', async (req, res) => {
    try {
        const { Id, From } = req.query
        const db = await connectDatabase()
        let query = `
            SELECT s.Student_ID, s.Student_Name, COUNT(a.Attendance_Id) AS Total_Classes, SUM(CASE WHEN a.Attendance_Status = 'Present' THEN 1 ELSE 0 END) AS Present_Count,
            SUM(CASE WHEN a.Attendance_Status = 'Absent' THEN 1 ELSE 0 END) AS Absent_Count,    SUM(CASE WHEN a.Attendance_Status = 'Late' THEN 1 ELSE 0 END) AS Late_Count,
            ROUND((SUM(CASE WHEN a.Attendance_Status = 'Present' THEN 1 ELSE 0 END) / COUNT(a.Attendance_Id)) * 100, 2) AS Attendance_Percentage
            FROM attendance a JOIN attendance_association aa ON a.Attendance_Id=aa.Attendance_Id JOIN student s ON aa.Student_Id = s.Student_ID
            WHERE 1=1
        `
        if (From === "class") query += ` AND aa.Class_ID = '${Id}'`
        if (From === "section") query += ` AND aa.Section_ID = '${Id}'`
        if (From === "student") query += ` AND aa.Student_ID = '${Id}'`
        // if (startDate && endDate) query += ` AND a.Attendance_Date BETWEEN '${startDate}' AND '${endDate}'`;

        query += " GROUP BY s.Student_ID, s.Student_Name"

        const [results] = await db.execute(query)
        console.log("Got the attendnace")

        res.json(results)
    } catch (err) {
        console.error("Overall Class js error:", err);
        res.status(500).json({ success: false, message: "Failed to get attendnaces" })
    }
})
router.get('/getAttendnaceByDate', async (req, res) => {
    try {
        const { Id } = req.query
        const db = await connectDatabase()


        const [results] = await db.execute(`SELECT c.Class_date, SUM(CASE WHEN a.Attendance_Status = 'Present' THEN 1 ELSE 0 END) AS Present_Count, 
            SUM(CASE WHEN a.Attendance_Status = 'Late' THEN 1 ELSE 0 END) AS Late_Count, SUM(CASE WHEN a.Attendance_Status = 'Absent' THEN 1 ELSE 0 END) AS
            Absent_Count FROM attendance a JOIN attendance_association aa ON a.Attendance_Id = aa.Attendance_Id Join class c on aa.Class_id= c.Class_id WHERE aa.Student_ID = ? 
            GROUP BY c.Class_date ORDER BY c.Class_date`, [Id])
        console.log("Got the attendnace by date")
        const formattedData = results.map(item => ({
            Attendance_Date: new Date(item.Class_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            Count: parseInt(item.Present_Count, 10)
        }));
        res.json(formattedData)

    } catch (err) {
        console.error("Overall Class js error:", err);
        res.status(500).json({ success: false, message: "Failed to get attendnace by date" })
    }
})

router.get('/getAbsenceMonth', async (req, res) => {
    try {
        const { Id } = req.query
        const db = await connectDatabase()


        const [results] = await db.execute(`SELECT 
                                    DATE_FORMAT(a.Attendance_Date, '%b') AS Month,  -- Extracts 'Jan', 'Feb', etc.
                                    SUM(CASE WHEN a.Attendance_Status = 'Absent' THEN 1 ELSE 0 END) AS Absent_Count
                                FROM attendance a
                                JOIN attendance_association aa ON a.Attendance_Id = aa.Attendance_Id
                                JOIN class c ON aa.Class_id = c.Class_id
                                WHERE aa.Student_ID =?
                                GROUP BY Month
                                ORDER BY STR_TO_DATE(Month, '%b')
                                `, [Id])
        console.log("Got the abasence month")
        res.json(results)

    } catch (err) {
        console.error("Overall Class js error:", err);
        res.status(500).json({ success: false, message: "Failed to get absence month" })
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