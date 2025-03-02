import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import FaceCapture from '../components/FaceCapture.jsx'



const CheckFace = ({ userId }) => {
  const [faceImgRegister, setFaceImgRegister] = useState('');
  const [image, setImage] = useState("");

  const base64ToFile = (base64String) => {
    const byteCharacters = atob(base64String.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: "image/jpeg" });
  };

  useEffect(() => {


    const getFaceDetails = async () => {
      try {

        const response = await axios.post(
          "http://localhost:3000/face/getFace",
          { userId: userId },
        );
        const faceData = response.data
        console.log("The face data is:", faceData);
        const base64Image = `data:image/jpeg;base64,${response.data.faceData}`;
        setFaceImgRegister(base64Image);

      } catch (error) {
        console.error('Error while getting the  face details:', error);
      }
    };

    if (userId) {
      getFaceDetails();
    }

  }, [userId]);




  return (
    <div>CheckFace
      the registered face is :
      <img src={faceImgRegister} alt="User Face" />
      <FaceCapture image={image} setImage={setImage} />

      {image !== '' && (
        <button>
          Register Face
        </button>
      )}



    </div>

  )
}

export default CheckFace