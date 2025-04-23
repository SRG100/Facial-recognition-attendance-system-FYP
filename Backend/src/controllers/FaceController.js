import express from 'express'
import multer from 'multer'
import { connectDatabase } from '../config/database.js'

const router = express.Router()

const storage = multer.memoryStorage(); // Store uploaded files in memory before processing
const upload = multer({ storage });

//to register student's face id
router.post('/registerFace', upload.single("image"), async (req, res) => {


  console.log("got to register face")

  const userId = req.body.userId;
  console.log("the user id is got in register face is:", userId)

  try {
    const db = await connectDatabase()
    console.log("Database connected successfully in face register!");
    const imageBuffer = req.file.buffer;
    const [result] = await db.execute(
      "INSERT INTO face (Face_data) VALUES (?)",
      [imageBuffer]
    )
    const faceId = result.insertId;
    await db.execute("UPDATE student SET Face_id = ? WHERE Student_Id = ?", [
      faceId,
      userId,
    ])
    res.json({ message: "Face registered successfully",success: true })
    console.log("Face registered successfully")
  } catch (err) {
    console.log("Database connected FAILED! of face registration", err);
    res.json({ message: "Database connection failed",success: false })
}})

router.post('/getFace', async (req, res) => {
  const db = await connectDatabase()

  console.log("got to get the user's face check")
  const { userId } = req.body;
  if (userId === null || userId === undefined) {
    console.log("got to get the user's face check but no face id")
    return res.status(501).json({ message: "No face id " })
  }
  const [faceResult] = await db.query('SELECT Face_id FROM student WHERE Student_Id=?', [userId])
  const Face_id = faceResult[0].Face_id
  const [rows] = await db.query('SELECT * FROM face WHERE Face_Id=?', [Face_id])

  if (rows.length === 0) {
    console.log("Face details not found");
    return res.status(404).json({ message: "Face details not found" });

  }
  const faceData = rows[0].Face_data
  
  const base64FaceData = faceData.toString('base64');
  res.status(200).json({ faceData: base64FaceData });

})
export default router