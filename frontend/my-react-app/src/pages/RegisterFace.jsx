import React,{useState} from 'react'
import FaceCapture from '../components/FaceCapture.jsx'
import axios from 'axios'
import Nav from '../components/Nav.jsx'

const RegisterFace = (userId) => {
  const[image,setImage]=useState("");

  const registerFace = async (e)=>{
    
    try{
        const response = await axios.post('http://localhost:3000/face/registerFace',{
          
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image }),
          userId:userId
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
      <Nav/>

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