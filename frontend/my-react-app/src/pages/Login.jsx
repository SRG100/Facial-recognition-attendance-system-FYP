import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
const Login=()=>{

    const errorMessage=''
    const navigate=useNavigate();

    const [values,setValues]=useState({
        email:'',
        password:''
    })
    const handleChanges =(e)=>{
        const { name, value } = e.target
        setValues({
          ...values,
          [name]: value,
        })
        
}
    //when the admin presses add student
    const handleSubmit = async (e)=>{
        e.preventDefault()
        try{
            const response = await axios.post('http://localhost:3000/auth/login',values)
            console.log(response.status)
            if(response.status===201){
              navigate('/')
            }
            
            if(response.status===200){
              navigate('/registerface')
            }
            console.log(response.data.message)
            // errorMessage=response.data.message
                       
        }catch(err){
            console.log(err)
        }
 
    } 
    return(
        <div>Login
            <div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='email'>Email Address</label>
                        <input type='text' placeholder="Email"
                        name="email" onChange={handleChanges}/>
                    </div>
                    <div>
                        <label htmlFor='password'>Password</label>
                        <input type='password' placeholder="Password"
                        name="password" onChange={handleChanges}/>

                    </div>

                    <button> Login</button>
                </form>
                {errorMessage}
            </div>
        </div>
    )
}

export default Login