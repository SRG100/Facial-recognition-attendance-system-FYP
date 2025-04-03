
import express from 'express'
import { connectDatabase } from '../config/database.js'

const router = express.Router()




router.post('/addModule', async (req, res) => {
    try {
        const { Module_id, Module_Name, Module_details, Module_Credits, Academic_Year_id, Course_id } = req.body
        const db = await connectDatabase()
        console.log(Module_id, Module_Name, Module_details, Module_Credits, Academic_Year_id, Course_id)
        console.log("Database connected successfully in add module';!");
        await db.execute(
            "INSERT INTO `module` (`Module_id`, `Module_Name`, `Module_details`, `Module_Credits`) VALUES (?, ?, ?, ?)",
            [Module_id, Module_Name, Module_details, Module_Credits]
        )
        await db.execute("INSERT INTO `module_course_academic` (`Module_id`, `Academic_Year_id`, `Course_id`) VALUES (?, ?, ?)", [Module_id, Academic_Year_id, Course_id])
        console.log("Sucessfully added the module.")
        res.json({
            success: true,
            message: "Added the module",
        })
    }
    catch (e) {
        console.log("error found:", e)
        res.json({
            success: false,
            message: "Error occured while adding module",
        })
    }
})
router.post('/addModuleAssociation', async (req, res) => {
    try {
        const { Module_id, Academic_Year_id, Course_id } = req.body
        const db = await connectDatabase()
        console.log(Module_id, Academic_Year_id, Course_id)
        console.log("Database connected successfully in add module associations!");
        await db.execute("INSERT INTO `module_course_academic` (`Module_id`, `Academic_Year_id`, `Course_id`) VALUES (?, ?, ?)", [Module_id, Academic_Year_id, Course_id])
        console.log("Sucessfully added the module association.")
        res.json({
            success: true,
            message: "Added the module associations",
        })
    }
    catch (e) {
        console.log("error found:", e)
        res.json({
            success: false,
            message: "Error occured while adding module associations",
        })
    }
})
router.post('/addSection', async (req, res) => {
    try {
        const { Section_id } = req.body
        const db = await connectDatabase()
        console.log("Database connected successfully in add sections !");
        await db.execute("INSERT INTO `section` (`Section_id`) VALUES (?)", [Section_id])
        console.log("Sucessfully added the sections.")
        res.json({
            success: true,
            message: "Added the sections",
        })
    }
    catch (e) {
        console.log("error found:", e)
        res.json({
            success: false,
            message: "Error occured while adding section",
        })
    }
})
router.get('/getAcademicYears', async (req, res) => {
    try {
        const db = await connectDatabase()
        console.log("Database connected successfully in get years !")
        const [years] = await db.execute("Select * from Academic_year")
        console.log("Sucessfully got the Academic year.")
        res.json(years)
    }
    catch (e) {
        console.log("error found:", e)
        res.json({
            success: false,
            message: "Error occured while adding section",
        })
    }
})
router.get('/getUserName', async (req, res) => {
    try {
        const { userId, userRole } = req.query
        const db = await connectDatabase()
        console.log("Database connected successfully in get user Name")
        let dbQuery
        if (userRole === "admin") dbQuery = 'Select Admin_Name from admin where admin_id = ?'
        const [years] = await db.execute("Select * from Academic_year")
        console.log("Sucessfully got the Academic year.")
        res.json(years)
    }
    catch (e) {
        console.log("error found:", e)
        res.json({
            success: false,
            message: "Error occured while adding section",
        })
    }
})

router.get('/getDashboardDetails', async (req, res) => {
    try {
        const { userId, userRole } = req.query
        const db = await connectDatabase()

        let students = []

        if (userRole === "teacher") {
            [students] = await db.query(`SELECT COUNT(DISTINCT s.Student_Id) AS Total_Students FROM Student s LEFT JOIN student_association sa ON s.Student_Id = sa.Student_Id
                                        JOIN section_association sec ON sa.Section_id = sec.Section_Id WHERE sec.teacher_id = ? `, [userId])
        }
        else {
            [students] = await db.query('Select Count(*) As Total_Students from student')
        }


        let Modules = []
        if (userRole === 'student') {
            [Modules] = await db.query('Select Count(m.Module_id) As Total_Modules  from module m join student_association sa on m.Module_id = sa.Module_id where sa.Student_Id=?', [userId])
        } else {
            [Modules] = await db.query('Select Count(*) As Total_Modules from module')
        }


        const [course] = await db.query('Select Count(*) As Total_Courses from course')


        let teachers = []
        if (userRole === 'student') {
            [teachers] = await db.query('Select Count(DISTINCT t.Teacher_id) As Total_Teachers from teacher t join section_association sea on t.Teacher_id = sea.Teacher_id join student_association sa on sea.Section_id = sa.Section_id where sa.Student_Id=?', [userId])
        } else {
            [teachers] = await db.query('Select Count(*) As Total_Teachers from teacher')
        }


        let classes = []

        if (userRole === 'student') {
            [classes] = await db.query(`SELECT COUNT(DISTINCT c.Class_Id) AS Total_Classes, COUNT(DISTINCT CASE WHEN c.Class_Completion = 1 THEN c.Class_Id END) AS Completed_Classes, 
                                        COUNT(DISTINCT CASE WHEN c.Class_Completion = 0 THEN c.Class_Id END) AS Remaining_Classes FROM student s JOIN student_association sa ON s.Student_Id = sa.Student_Id 
                                        JOIN section sec ON sa.Section_Id = sec.Section_Id JOIN section_association sec_a ON sec.Section_Id = sec_a.Section_Id JOIN class_association ca ON sec_a.Section_Id = ca.Section_Id 
                                        AND sa.Course_id = ca.Course_id AND sa.Module_id = ca.Module_id 
                                        JOIN class c ON ca.Class_Id = c.Class_Id WHERE s.Student_Id =?`, [userId]);

        } 
        if (userRole === 'teacher') {
            [classes] = await db.query(`SELECT COUNT(DISTINCT c.Class_Id) AS Total_Classes, COUNT(DISTINCT CASE WHEN c.Class_Completion = 1 THEN c.Class_Id END) AS Completed_Classes, 
                                    COUNT(DISTINCT CASE WHEN c.Class_Completion = 0 THEN c.Class_Id END) AS Remaining_Classes FROM teacher t 
                                    JOIN teacher_association ta ON t.Teacher_Id = ta.Teacher_Id JOIN class_association ca ON ta.Module_id = ca.Module_Id AND ta.Course_id = ca.Course_id 
                                    JOIN class c ON ca.Class_Id = c.Class_Id JOIN section sec ON ca.Section_Id = sec.Section_Id JOIN module m ON ca.Module_Id = m.Module_Id
                                    WHERE t.Teacher_Id = 1`,[userId])

        } 
        console.log(userId, classes)

        res.json({
            success: true,
            data: {
                totalStudents: students[0]?.Total_Students || 0,
                totalModules: Modules[0]?.Total_Modules || 0,
                totalCourses: course[0]?.Total_Courses || 0,
                totalTeachers: teachers[0]?.Total_Teachers || 0,
                upComingClass:classes[0]?.Remaining_Classes || 0,
                completedClass:classes[0]?.Completed_Classes || 0,
            }
        });


    } catch (err) {
        console.log("error found:", err)
        res.json({
            success: false,
            message: "Error occured getting dashboard details",
        })
    }
})
router.post('/addSectionAssociations', async (req, res) => {
    try {
        const { Module_id, Academic_Year_id, Course_id, Teacher_id, Section_id } = req.body
        const db = await connectDatabase()
        console.log("Database connected successfully in add sections !");
        await db.execute("INSERT INTO `section_association` (`Module_id`, `Academic_Year_id`, `Course_id`, `Teacher_id`, `Section_id`) VALUES (?, ?, ?, ?, ?)", [Module_id, Academic_Year_id, Course_id, Teacher_id, Section_id])
        console.log("Sucessfully added the sections.")
        res.json({
            success: true,
            message: "Added the sections",
        })
    }
    catch (e) {
        console.log("error found:", e)
        res.json({
            success: false,
            message: "Error occured while adding section",
        })
    }
})

router.post('/addClass', async (req, res) => {
    try {
        const { Section_id, Class_id, Class_Start_Time, Class_End_Time, Class_Day, Class_Date, Class_Type, Teacher_id } = req.body
        const db = await connectDatabase()
        console.log("Database connected successfully in add course !");
        const [section_association] = await db.execute("Select * from section_association where section_id=? AND teacher_id=?", [Section_id, Teacher_id])
        console.log(section_association[0].Module_id)
        const Module_id = section_association[0].Module_id
        const Academic_Year_id = section_association[0].Academic_Year_id
        const Course_id = section_association[0].Course_id

        const [newClass] = await db.execute("INSERT INTO `class` (`Class_id`, `Class_Start_Time`, `Class_End_Time`, `Class_Day`, `Class_Date`, `Class_Type`) VALUES (?, ?, ?, ?,?, ?)", [Class_id, Class_Start_Time, Class_End_Time, Class_Day, Class_Date, Class_Type])
        await db.execute("INSERT INTO `class_association` (`Module_id`, `Academic_Year_id`, `Course_id`, `Teacher_id`, `Section_id`, `Class_id`) VALUES (?, ?, ?, ?,?, ?)", [Module_id, Academic_Year_id, Course_id, Teacher_id, Section_id, Class_id])
        // await db.execute("INSERT INTO `section` (`Section_id`) VALUES (?)", [Section_id])
        console.log("Sucessfully added the classes and its associations")
        res.json({
            success: true,
            message: "Added the sections",
        })
    }
    catch (e) {
        console.log("error found:", e)
        res.json({
            success: false,
            message: "Error occured while adding section",
        })
    }
})





export default router