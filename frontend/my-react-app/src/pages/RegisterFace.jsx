import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FaceCapture from '../components/FaceCapture.jsx'
import axios from 'axios'
import Nav from '../components/Nav.jsx'
import SidebarComponent from '../components/SideBar.jsx'
import PageNotFound from '../components/PageNotFound.jsx'
import { toast } from "react-hot-toast";
import Header from '../components/Header'

const RegisterFace = ({ userId, userRole, userName }) => {
  const [image, setImage] = useState("")
  const navigate = useNavigate()
  const fromNavigate = localStorage.getItem("fromNavigate") === "true"
  console.log("the from navigate is:", fromNavigate)
  console.log("the user id is:", userId)

  if (!fromNavigate) {
    return <PageNotFound />
  } else {
    localStorage.removeItem("fromNavigate")
  }

  const base64ToFile = (base64String) => {
    const byteCharacters = atob(base64String.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: "image/jpeg" });
  }

  const registerFace = async (e) => {

    try {
      const file = new File([base64ToFile(image)], "face_image.jpg", { type: "image/jpeg" });

      const formData = new FormData()
      formData.append("image", file)
      formData.append("userId", String(userId))

      const response = await axios.post("http://localhost:3000/face/registerFace", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: {
          userId: userId
        }
      })
      if (response.data.success) {
        toast.success("Face registered successfully")
        navigate("/")
      }
      else {
        toast.error("Face registration failed")
      }
      console.log(response.data.message)


    } catch (err) {
      console.log(err)
    }

  }
  return (
    <div>
      <SidebarComponent userRole={userRole} />
      <div className='home-section'>
        <Header userRole={userRole} userName={userName} />
        <div className='mt-10 mb-10'>
          <FaceCapture image={image} setImage={setImage} />

          {image !== '' && (
            <div className="flex justify-center mt-6">

              <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                onClick={registerFace}>
                Register Face
              </button>
            </div>

          )}
        </div>


      </div>


    </div>
  )
}

export default RegisterFace