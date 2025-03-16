import express from 'express'
import cors from 'cors'
import authRouter from './routes/authRoutes.js'
import faceRoutes from './routes/face.js'
import classDetails from './routes/overallClasses.js'
import cookieParser from "cookie-parser";
import verifications from './routes/verification.js'
import reviewForm from './routes/reviewForm.js'
import crud from './routes/adminCRUD.js'



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
app.use('/review',reviewForm)
app.use('/crud',crud)



app.listen(process.env.PORT,()=> {
    console.log("Server is Running")
})