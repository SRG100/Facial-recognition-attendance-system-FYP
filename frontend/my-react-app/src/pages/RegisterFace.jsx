import React, { useState } from 'react'
import FaceCapture from '../components/FaceCapture.jsx'
import axios from 'axios'
import Nav from '../components/Nav.jsx'
import SidebarComponent from '../components/SideBar.jsx'

const RegisterFace = ({userId,userRole}) => {
  const [image, setImage] = useState("");

  const base64ToFile = (base64String) => {
    const byteCharacters = atob(base64String.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: "image/jpeg" });
  }

  const registerFace = async (e) => {

    try {
      const file = new File([base64ToFile(image)], "face_image.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", file); 
      formData.append("userId", String(userId));

      const response = await axios.post("http://localhost:3000/face/registerFace", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body:{
          userId:userId
        }
      })
      console.log(response.status)

      console.log(response.data.message)
      // errorMessage=response.data.message

    } catch (err) {
      console.log(err)
    }

  }
  return (
    <div>RegisterFace
      <SidebarComponent userRole={userRole}/>
      <div>the user id is : {userId}</div>
      <FaceCapture image={image} setImage={setImage} />
      
      {image !== '' && (
        <button onClick={registerFace}>
          Register Face
        </button>
      )}

    </div>
  )
}

export default RegisterFace