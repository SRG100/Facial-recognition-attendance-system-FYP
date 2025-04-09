import express from 'express'
import { connectDatabase } from '../config/database.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';
const app = express()

app.use(cookieParser());
const router = express.Router()

router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;

    let rows = [];
    let id
    let userName
    try {
        const db = await connectDatabase()
        console.log("Database connected successfully!");
        if (role === 'student') {
            [rows] = await db.query('SELECT * FROM student WHERE Student_Email=?', [email])
            if (rows.length > 0) {

                id = rows[0].Student_Id
                userName = rows[0].Student_Name
            }

        } else if (role === 'teacher') {
            [rows] = await db.query('SELECT * FROM teacher WHERE Teacher_Email=?', [email])
            if (rows.length > 0) {
                id = rows[0].Teacher_id
                userName = rows[0].Teacher_Name
            }

        } else if (role === 'admin') {
            [rows] = await db.query('SELECT * FROM admin WHERE Admin_Email=?', [email])
            if (rows.length > 0) {
                id = rows[0].Admin_id
                userName = rows[0].Admin_Name
            }

        } else {
            return res.json({ message: "Invalid role provided", success: false });
        }


        if (rows.length === 0) {
            console.log("User with this email doesn't exists");
            return res.json({ message: "Invalid Credentials", success: false })
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
            console.log("Inside the password check for users except admin")
            isMatch = await bcrypt.compare(password, rows[0].Password)
        }

        if (!isMatch) {
            console.log("Wrong Password");
            return res.json({ message: "Wrong Password", success: false })
        }
        console.log("Login ok")
        const token = jwt.sign(
            { id: id, role: role, userName: userName },
            process.env.JWT_KEY,
            { expiresIn: "3h" }
        )
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "Strict",
            maxAge: 3 * 60 * 60 * 1000,
            path: '/'
        });

        if (role === "student") {
            console.log("Now check face id");

            const Faceid = rows[0].Face_id;
            if (Faceid == null) {
                console.log("No face ID");
                return res.status(201).json({ success: false, message: "Login Sucessful, No Face id deteched", redirect: "/registerface" });
            }
        }
        console.log("Login")
        return res.status(201).json({ success: true, message: "Login successful", redirect: "/", token: token });


    } catch (err) {
        console.log("The following error has occured", err);
        res.status(500).json({ message: "Error while Logging in/ Please turn xaamp on", success: false })
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
            role: decoded.role,
            userName: decoded.userName
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

