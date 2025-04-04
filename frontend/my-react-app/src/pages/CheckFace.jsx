import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import FaceCapture from '../components/FaceCapture.jsx'
import SidebarComponent from '../components/SideBar.jsx'


const CheckFace = ({ userId ,userRole }) => {
  const [faceImgRegister, setFaceImgRegister] = useState('')
  const [image, setImage] = useState("")
  const [registeredFace, setRegisteredFace] = useState(null)
  // const [verified, setVerified] = useState(null);
  const navigate = useNavigate()
  const location = useLocation()
  const Class_Id = location.state?.Class_Id
  const Attendance_id = location.state?.Attendance_id


  useEffect(() => {
    const getFaceDetails = async () => {
      try {
        const response = await axios.post(
          "http://localhost:3000/face/getFace",
          { userId: userId },
        )
        const faceData = response.data
        // console.log("The face data is:", faceData)
        const base64Image = `data:image/jpeg;base64,${response.data.faceData}`
        const base64Img = faceData.faceData
        setFaceImgRegister(base64Image)
        setRegisteredFace(base64Img)


      } catch (error) {
        console.error('Error while getting the  face details:', error)
      }
    };

    if (userId) {
      getFaceDetails()
    }

  }, [userId])

  const VerifyFace = async () => {
    try {
      console.log("Now verifying the face")
      const uploadedImage = image
      const registeredImage = registeredFace

      const formData = {
        uploadedImage: uploadedImage,
        registeredImage: registeredImage
      }

      const response = await axios.post("http://127.0.0.1:5000/verifyFace", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      const verified = response.data.verified
      console.log("The face verification is:", verified)
      
      const formData1 = new FormData();
      formData1.append("verified", verified)
      formData1.append("Attendance_id", Attendance_id)

      if (verified) {
        
        await axios.get(`http://localhost:3000/verification/faceVerified?Attendance_id=${Attendance_id}`);

        alert("Your face has been verified")
        navigate("/verifylocation", { state: { Class_Id, Attendance_id } })
      } else {
        alert("Your face has not been verified")
      }
    } catch (error) {
      console.error('Error while getting the  face details:', error)
    }
  };



  return (
    <div>
      <SidebarComponent userRole={userRole}/>
      CheckFace
      the registered face is :
      {/* <img src={faceImgRegister} alt="User Face" /> */}
      <FaceCapture image={image} setImage={setImage} />

      {image !== '' && (
        <button className='btn btn-success' onClick={VerifyFace}>
          Verify Face
        </button>
      )}



    </div>

  )
}

export default CheckFace