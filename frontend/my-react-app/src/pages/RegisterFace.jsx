import React,{useState} from 'react'
import FaceCapture from '../components/FaceCapture.jsx'
import axios from 'axios'

const RegisterFace = () => {
  const[image,setImage]=useState("");

  const registerFace = async (e)=>{
    
    try{
        const response = await axios.post('http://localhost:3000/face/registerFace',{
          
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image }),
      })
        console.log(response.status)
        
        console.log(response.data.message)
        // errorMessage=response.data.message
                   
    }catch(err){
        console.log(err)
    }

} 
  return (
    <div>RegisterFace
      <FaceCapture image={image} setImage={setImage}/>
    
      

      {image !== '' && (
          <button onClick={registerFace} className="webcam-btn">
              Register Face
          </button>
      )}

    </div>
  )
}
  
export default RegisterFace