import express from 'express'
import { connectDatabase } from '../config/database.js'
const router = express.Router()

const calculateDistance = (studentLat, studentLon, teacherLat, teacherLon) => {
    const R = 6371e3; // Earth's radius in meters
    const studentLatRad = studentLat * Math.PI / 180;
    const teacherLatRad = teacherLat * Math.PI / 180;
    const deltaLat = (teacherLat - studentLat) * Math.PI / 180;
    const deltaLon = (teacherLon - studentLon) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(studentLatRad) * Math.cos(teacherLatRad) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))


    let distance = R * c
    console.log(`Calculated Distance: ${distance} meters`)

    return parseFloat(distance.toFixed(2))
}

router.get('/faceVerified', async (req, res) => {
    try {
        const db = await connectDatabase()
        console.log("Database connected successfully in face verified!")
        const Attendance_id = req.query.Attendance_id
        console.log(Attendance_id)
        await db.query(
            "UPDATE attendance SET Face_Verified = 1 WHERE Attendance_Id = ?",
            [ Attendance_id]
        )
        res.json({
            success: true,
            message: "Face is authorized",
            verified: true

        })
    }
    catch (err) {
        console.log("The error is :", err)
        res.json({
            success: true,
            message: "Face is authorized",
            verified: true
        })
    }
})

router.get('/locationVerification', async (req, res) => {
    try {
        const db = await connectDatabase();
        console.log("Database connected successfully!")
        console.log("Got to get the location verification API")

        const { Class_Id, studentLongitude, studentLatitude, Attendance_id } = req.query

        const [result] = await db.query("SELECT * FROM `class` WHERE Class_id=?", [Class_Id])
        const teacherLongitude = result[0].Teacher_Longitude
        const teacherLatitude = result[0].Teacher_Latitude

        console.log("The student longitude is:", studentLongitude)
        console.log("The student latitude is:", studentLatitude)
        console.log("The teacher longitude is:", teacherLongitude)
        console.log("The teacher latitude is:", teacherLatitude)

        const distance = calculateDistance(studentLatitude, studentLongitude, teacherLatitude, teacherLongitude)
        console.log("The distance between teacher and student is:", distance)
        const [attendnaceData] = await db.query("SELECT Geolocation_Status, Face_Verified, Code, Warnings FROM attendance WHERE attendance_id = ?", [Attendance_id]);
        let Warnings=attendnaceData[0]?.Warnings || 0

        // If the distance is less than 50m or zero
        if (distance < 50 || distance === 0) {
            await db.query(
                "UPDATE attendance SET Geolocation_Status = 1, Geolocation_latitude = ?, Geolocation_longitude = ? WHERE Attendance_Id = ?",
                [studentLatitude, studentLongitude, Attendance_id]
            );

            const [finalVerification] = await db.query("SELECT Geolocation_Status, Face_Verified, Code FROM attendance WHERE attendance_id = ?", [Attendance_id]);
            const { Face_Verified, Code, Geolocation_Status } = finalVerification[0]

            if ( Face_Verified===1 && Code === 1 && Geolocation_Status === 1) {
                await db.query(
                    "UPDATE attendance SET Attendance_Status = 'Present' WHERE Attendance_Id = ?",
                    [Attendance_id]
                );
                return res.json({
                    success: true,
                    message: "Location is authorized",
                    verified: true,
                    distance: distance
                });
            }


        } else {
            if (Warnings < 3) {
                await db.query(
                    "UPDATE attendance SET Warnings = ? WHERE Attendance_Id = ?",
                    [Warnings + 1, Attendance_id]
                );
                return res.json({
                    success: true,
                    message: `Location is not authorized. Warning ${Warnings + 1} of 3.`,
                    verified: false,
                    distance: distance
                });
            } else {
                // If the student has 3 warnings, mark them as absent
                await db.query(
                    "UPDATE attendance SET Attendance_Status = 'Absent' WHERE Attendance_Id = ?",
                    [Attendance_id]
                );
                return res.json({
                    success: false,
                    message: "You have received 3 warnings. Attendance marked as Absent.",
                    verified: false,
                    distance: distance
                });
            }
        }
    } catch (err) {
        console.error("Location verification error:", err);
        res.status(500).json({ success: false, message: "Location verification failed" });
    }
})


router.get('/locationData', async (req, res) => {
    try {
        const db = await connectDatabase();
        const { Class_Id } = req.query;

        const [result] = await db.query("SELECT Teacher_Longitude, Teacher_Latitude,Class_Start_Time,Class_End_Time, class_completion FROM class WHERE Class_id=?", [Class_Id]);

        if (!result.length) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }

        res.json({
            success: true,
            classCompletion: result[0].class_completion,
            classStartTime: result[0].Class_Start_Time,
            classEndTime: result[0].Class_End_Time

        });

    } catch (err) {
        console.error("Error fetching location data:", err);
        res.status(500).json({ success: false, message: "Failed to fetch location data" });
    }
});


router.get('/codeVerification', async (req, res) => {
    try {
        const db = await connectDatabase()
        console.log("Database connected successfully!");
        console.log("got to the class code verification api")
        const { Class_Id, studentClassCode, Attendance_id } = req.query
        console.log("The class id got in code verfication is", Class_Id)
        console.log("The attendance  in code verfication is", Attendance_id)
        console.log("The student enterned code is", studentClassCode)
        const [result] = await db.query("SELECT * FROM `class` WHERE Class_id=?", [Class_Id])
        const autualClassCode = result[0].Class_Code
        console.log("The actual code is", autualClassCode)

        if (autualClassCode === studentClassCode) {
            await db.query("UPDATE attendance SET Code = 1 WHERE attendance.Attendance_Id = ?", [Attendance_id])
            res.json({
                success: true,
                message: "Code is incorrect",
                codeVerified: true,
            })


        }
        else {
            res.json({
                success: true,
                message: "Code is incorrect",
                codeVerified: false,
            })
        }

    } catch (err) {
        console.error("Location verification error:", err);
        res.status(500).json({ success: false, message: "Location verificaton of student Failed" });
    }
})

export default router