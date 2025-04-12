
import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()

router.get('/getAttendnaceDetails', async (req, res) => {
    try {
        const { Id, From ,userRole,userId,Module_id} = req.query
        console.log(Id, From ,userRole,userId,Module_id)
        const db = await connectDatabase()
        let query = `
            SELECT s.Student_ID, s.Student_Name, COUNT(a.Attendance_Id) AS Total_Classes, SUM(CASE WHEN a.Attendance_Status = 'Present' THEN 1 ELSE 0 END) AS Present_Count,
            SUM(CASE WHEN a.Attendance_Status = 'Absent' THEN 1 ELSE 0 END) AS Absent_Count,    SUM(CASE WHEN a.Attendance_Status = 'Late' THEN 1 ELSE 0 END) AS Late_Count,
            ROUND((SUM(CASE WHEN a.Attendance_Status = 'Present' THEN 1 ELSE 0 END) / COUNT(a.Attendance_Id)) * 100, 2) AS Attendance_Percentage
            FROM attendance a JOIN attendance_association aa ON a.Attendance_Id=aa.Attendance_Id JOIN student s ON aa.Student_Id = s.Student_ID
            WHERE 1=1
        `
        if (From === "class") query += ` AND aa.Class_ID = '${Id}'`
        if (From === "student") query += ` AND aa.Student_ID = '${Id}'`
        if(From ==="teacher") query += ` AND aa.Student_ID = '${Id}'`
        if (userRole === "teacher") query += ` AND aa.Teacher_id = '${userId}'`
        if (Module_id!=undefined) query+= `And aa.Module_id = '${Module_id}'`

        query += " GROUP BY s.Student_ID, s.Student_Name"
        console.log(query)

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
        const { Id, userRole, fromDate, toDate } = req.query
        const db = await connectDatabase()
        let query = `
            SELECT c.Class_date, SUM(CASE WHEN a.Attendance_Status = 'Present' THEN 1 ELSE 0 END) AS Present_Count, 
            SUM(CASE WHEN a.Attendance_Status = 'Late' THEN 1 ELSE 0 END) AS Late_Count, 
            SUM(CASE WHEN a.Attendance_Status = 'Absent' THEN 1 ELSE 0 END) AS Absent_Count 
            FROM attendance a 
            JOIN attendance_association aa ON a.Attendance_Id = aa.Attendance_Id 
            JOIN class c ON aa.Class_id = c.Class_id
            WHERE 1=1
        `
        if (userRole === "student") query += ` AND aa.Student_ID = '${Id}'`
        if (userRole === "teacher") query += ` AND aa.Teacher_id = '${Id}'`
        
        if (fromDate) query += ` AND c.Class_date >= '${fromDate}'`
        if (toDate) query += ` AND c.Class_date <= '${toDate}'`

        query += ` GROUP BY c.Class_date ORDER BY c.Class_date`

        const [results] = await db.execute(query)
        console.log("Got the attendance by date")
        const formattedData = results.map(item => ({
            Attendance_Date: new Date(item.Class_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            Count: parseInt(item.Present_Count, 10)
        }));
        res.json(formattedData)

    } catch (err) {
        console.error("Overall Class js error:", err);
        res.status(500).json({ success: false, message: "Failed to get attendance by date" })
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


// Add this endpoint to your existing attendance router file
// Add these endpoints to your existing attendance router file

// Update attendance status
router.post('/updateAttendanceStatus', async (req, res) => {
    try {
        const { changes, classId, updatedBy } = req.body;
        
        if (!changes || !Array.isArray(changes) || changes.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "No attendance changes provided" 
            });
        }
        
        const db = await connectDatabase();
        
        // Start a transaction to ensure data consistency
        await db.beginTransaction()
        
        try {
            // Update each attendance record
            for (const change of changes) {
                const { attendanceId, newStatus } = change
                
                // Update the attendance status
                await db.execute(
                    `UPDATE attendance 
                     SET Attendance_Status = ?
                     WHERE Attendance_Id = ?`,
                    [newStatus, attendanceId]
                )
            }
            
            await db.commit()
            
            console.log(`Updated ${changes.length} attendance records for class ${classId}`);
            
            res.json({ 
                success: true, 
                message: `Successfully updated ${changes.length} attendance records` 
            });
            
        } catch (error) {
            // If an error occurs, roll back the transaction
            await db.rollback();
            throw error;
        }
        
    } catch (err) {
        console.error("Update attendance status error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to update attendance status" 
        });
    }
});

// Update the getClassAttendance endpoint to include the Attendance_Id
router.get('/getClassAttendance', async (req, res) => {
    try {
        const { classId } = req.query;
        
        if (!classId) {
            return res.status(400).json({ success: false, message: "Class ID is required" });
        }
        
        const db = await connectDatabase();
        
        const query = `
            SELECT 
                a.Attendance_Id,
                s.Student_ID, 
                s.Student_Name, 
                a.Attendance_Status,
                a.Attendance_Time,
                a.Attendance_Date,
                c.Class_Date
            FROM 
                attendance a 
                JOIN attendance_association aa ON a.Attendance_Id = aa.Attendance_Id
                JOIN student s ON aa.Student_Id = s.Student_ID
                JOIN class c ON aa.Class_Id = c.Class_Id
            WHERE 
                aa.Class_Id = ?
            ORDER BY 
                s.Student_Name
        `;
        
        const [results] = await db.execute(query, [classId]);
        console.log("Got class attendance records");
        
        res.json(results);
    } catch (err) {
        console.error("Class attendance error:", err);
        res.status(500).json({ success: false, message: "Failed to get class attendance" });
    }
});
export default router