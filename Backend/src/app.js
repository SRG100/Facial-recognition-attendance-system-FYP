import express from 'express'
import cors from 'cors'
import authRouter from './routes/authRoutes.js'
import faceRoutes from './routes/face.js'
import classDetails from './routes/overallClasses.js'
import cookieParser from "cookie-parser";
import verifications from './routes/verification.js'
import crud from './routes/adminCRUD.js'
import teacher from './controllers/TeachersController.js'
import module from './controllers/ModuleController.js'
import student from './controllers/StudentsController.js'
import review from './controllers/ReviewController.js'
import section from './controllers/SectionController.js'
import course from './controllers/CourseController.js'
const app = express()

app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true 
}))

app.use(express.json())

app.use('/auth',authRouter)
app.use('/face',faceRoutes)
app.use('/classes',classDetails)
app.use('/verification',verifications)
app.use('/crud',crud)
app.use('/teachers',teacher)
app.use('/modules',module)
app.use('/students',student)
app.use('/sections',section)
app.use('/reviews',review)
app.use('/courses',course)

app.listen(process.env.PORT,()=> {
    console.log("Server is Running")
})