
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
        const { Id, userRole } = req.query
        const db = await connectDatabase()
        let query = `
            SELECT c.Class_date, SUM(CASE WHEN a.Attendance_Status = 'Present' THEN 1 ELSE 0 END) AS Present_Count, 
            SUM(CASE WHEN a.Attendance_Status = 'Late' THEN 1 ELSE 0 END) AS Late_Count, SUM(CASE WHEN a.Attendance_Status = 'Absent' THEN 1 ELSE 0 END) AS
            Absent_Count FROM attendance a JOIN attendance_association aa ON a.Attendance_Id = aa.Attendance_Id Join class c on aa.Class_id= c.Class_id
            WHERE 1=1
        `
        if (userRole === "student") query += ` AND aa.Student_ID = '${Id}'`
        if (userRole === "teacher") query += ` AND aa.Teacher_id = '${Id}'`

        query += ` GROUP BY c.Class_date ORDER BY c.Class_date`
        
        const [results] = await db.execute(query)
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
                                    DATE_FORMAT(a.Attendance_Date, '%b') AS Month,
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


router.get('/generateReport', async (req, res) => {
    try {
        const { Module, From, To, Id } = req.query
        const db = await connectDatabase()
        console.log(Module, From, To)
        let query = `select m.Module_Name, c.Class_id, c.Class_Type, DATE_FORMAT(c.Class_Date, '%Y-%m-%d') AS Class_Date, a.Attendance_Time, 
                            (CASE WHEN a.Attendance_Status = 'Present' THEN 1 ELSE 0 END) AS Present, 
                            (CASE WHEN a.Attendance_Status = 'Late' THEN 1 ELSE 0 END) AS Late, 
                            (CASE WHEN a.Attendance_Status = 'Absent' THEN 1 ELSE 0 END) AS Absent
                        FROM attendance a 
                        JOIN attendance_association aa ON a.Attendance_Id = aa.Attendance_Id
                        JOIN module m ON aa.Module_id = m.Module_id 
                        JOIN class c ON aa.Class_Id = c.Class_Id  
                        WHERE aa.Student_ID = ?`

        if (Module !== "All") query += ` And m.Module_id = ?`
        query += ` AND c.Class_Date BETWEEN ? AND ?`
        let report = []
        if (Module === "All") {
            report = await db.query(query, [Id, From, To])
        }
        else {
            report = await db.query(query, [Id, Module, From, To])
        }

        console.log(report)
        res.json(Module)

    } catch (err) {
        console.error("Attendnace Report error:", err);
        res.status(500).json({ success: false, message: "Failed to get generate attendnace" })
    }
})
router.get('/getAttendanceBySubject', async (req, res) => {
    try {
        const { Id } = req.query
        const db = await connectDatabase()
        const [results] = await db.execute(`SELECT aa.Module_id,m.Module_name, SUM(CASE WHEN a.Attendance_Status = 'Present' THEN 1 ELSE 0 END) AS Present_Count, 
            SUM(CASE WHEN a.Attendance_Status = 'Late' THEN 1 ELSE 0 END) AS Late_Count, 
            SUM(CASE WHEN a.Attendance_Status = 'Absent' THEN 1 ELSE 0 END) AS Absent_Count 
            FROM attendance a JOIN attendance_association aa ON a.Attendance_Id = aa.Attendance_Id
            Join module m on aa.Module_id= m.Module_id WHERE aa.Student_ID = ? GROUP BY m.Module_id,m.Module_Name 
            ORDER BY m.Module_id`, [Id])
        console.log("Got the present by  module")
        res.json(results)

    } catch (err) {
        console.error("Overall Class js error:", err);
        res.status(500).json({ success: false, message: "Failed to get absence month" })
    }
})




export default router