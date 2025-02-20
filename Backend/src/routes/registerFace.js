import express from 'express'
import multer from 'multer'
import {connectDatabase} from  '../config/database.js'

const router = express.Router()

const storage = multer.memoryStorage(); // Store uploaded files in memory before processing
const upload = multer({ storage }); 

//to register student's face id
router.post('/registerFace', upload.single("image"),async (req,res) => {

    
    console.log("got to register face")

    const userId = req.body.userId;
    console.log("the user id is got in register face is:",userId)

    try{
        const db=await connectDatabase()
        console.log("Database connected successfully in face register!");
        const imageBuffer = req.file.buffer;
        const [result] = await db.execute(
          "INSERT INTO face (Face_data) VALUES (?)",
          [imageBuffer]
        );
    
        const faceId = result.insertId;
        console.log("Newly inserted Face_id:", faceId);

        await db.execute("UPDATE student SET Face_id = ? WHERE Student_Id = ?", [
          faceId,
          userId,
        ]);

    }catch(err){
        res.status(500).json(err)

        console.log("Database connected FAILED! of face registration", err);
    }

})
export default router