import express from 'express'
import { connectDatabase } from '../config/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';
const app = express();

app.use(cookieParser());
const router = express.Router()



//to register students 
router.post('/registerStudent', async (req, res) => {
    const { studentId, studentName, studentEmail, studentAddress, studentDOB, studentPassword } = req.body;
    console.log(studentName)
    try {
        const db = await connectDatabase()
        console.log("Database connected successfully!");


        const [rows] = await db.query('SELECT * FROM student WHERE Student_Email=?', [studentEmail])
        if (rows.length > 0) {
            return res.status(409).json({ message: "Student with this email already exists" })
        }

        const hashPassword = await bcrypt.hash(studentPassword, 10)

        await db.query("INSERT INTO student (Student_Id,Student_Name,Student_Address,Student_Email,Student_DOB,Password) VALUES (?,?,?,?,?,?)",
            [studentId, studentName, studentAddress, studentEmail, studentDOB, hashPassword])
        console.log("Sucessfully regiosterd student")
        res.status(201).json({ message: "Student Added successfully" })
    } catch (err) {
        res.status(500).json(err)

        console.log("Database connected FAILED!", err);
    }

})

router.post('/registerTeacher', async (req, res) => {

    const { teacherId, teacherName, teacherEmail, teacherAddress, teacherDOB, teacherGender, teacherPassword } = req.body;

    try {
        const db = await connectDatabase()
        console.log("Database connected successfully!");
        const [rows] = await db.query('SELECT * FROM teacher WHERE Teacher_Email=?', [teacherEmail])
        if (rows.length > 0) {
            return res.status(409).json({ message: "Teacher with this email already exists" })
        }
        const hashPassword = await bcrypt.hash(teacherPassword, 10)
        await db.query("INSERT INTO teacher (Teacher_id,Teacher_Name,Teacher_Address,Teacher_DOB,Teacher_Email,Teacher_Gender,Password) VALUES (?,?,?,?,?,?,?)",
            [teacherId, teacherName, teacherAddress, teacherDOB, teacherEmail, teacherGender, hashPassword])
        res.status(201).json({ message: "Teacher Added successfully"})
    } catch (err) {
        res.status(500).json(err)

        console.log("Database connected FAILED!", err);
    }

})

//to register students 
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    let rows = [];
    let id
    try {
        const db = await connectDatabase()
        console.log("Database connected successfully!");
        if (role === 'student') {
            [rows] = await db.query('SELECT * FROM student WHERE Student_Email=?', [email])
            id = rows[0].Student_Id

        } else if (role === 'teacher') {
            [rows] = await db.query('SELECT * FROM teacher WHERE Teacher_Email=?', [email])
            id = rows[0].Teacher_id

        } else if (role === 'admin') {
            [rows] = await db.query('SELECT * FROM admin WHERE Admin_Email=?', [email])
            id = rows[0].Admin_id

        } else {
            return res.status(400).json({ message: "Invalid role provided" });
        }


        if (rows.length === 0) {
            console.log("User with this email doesn't exists");
            return res.status(404).json({ message: "User with this email doesn't exists" })
        }
        let isMatch
        if (role === 'admin') {
            console.log("inside the password check for  admin")
            let isCorrect = false
            if (password === rows[0].Password) {
                isCorrect = true
            }
            isMatch = isCorrect
        }
        else {
            console.log("inside the password check for users except admin")
            isMatch = await bcrypt.compare(password, rows[0].Password)
        }

        if (!isMatch) {
            console.log("Wrong Password");
            return res.status(401).json({ message: "Wrong Password" })
        }
        console.log("Login ok");

        console.log("the user id is:", id)
        const token = jwt.sign(
            { id: id, role: role },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
            maxAge: 3600000,
            path: '/'
        });

        if (role === "student") {
            console.log("Now check face id");

            const Faceid = rows[0].Face_id;
            if (Faceid == null) {
                console.log("No face ID");
                return res.status(201).json({ success: false, message: "Face ID is not registered", redirect: "/registerface" });
            }
        }
        console.log("Login")
        return res.status(201).json({ success: true, message: "Login successful", redirect: "/", token: token });


    } catch (err) {
        console.log("The following error has occured", err);
        res.status(500).json(err)
    }

})
router.get('/isAuthorized', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        res.json({
            success: true,
            message: "User is authorized",
            userId: decoded.id,
            role: decoded.role
        })


    } catch (err) {
        console.error("Authorization error:", err);
        res.status(500).json({ success: false, message: "Authorization Failed" });
    }
})

router.get('/logout', async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.json({ success: true, message: "Logged out successfully" });
    }
    catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ success: false, message: "Logout failed" });

    }
});

export default router;

