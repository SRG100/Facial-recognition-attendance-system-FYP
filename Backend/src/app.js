import express from 'express'
import cors from 'cors'
import authRouter from './routes/authRoutes.js'
import registerFace from './routes/registerFace.js'
import cookieParser from "cookie-parser";



const app = express()
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true 
}));app.use(express.json())
app.use('/auth',authRouter)
app.use('/face',registerFace)

app.listen(process.env.PORT,()=> {
    console.log("Server is Running")
})