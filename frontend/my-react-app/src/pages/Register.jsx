import React, {useState} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
const Register=()=>{

    const errorMessage=''
    const [values,setValues]=useState({
        studentId:'',
        studentName:'',
        studentEmail:'',
        studentAddress:'',
        studentDOB:'',
        studentPassword:''
    })
    const handleChanges =(e)=>{
        const { name, value } = e.target
        if (name === 'studentDOB') {
            setValues({
              ...values,
              [name]: value,
              studentPassword: value,
            })
          } 
          else {
            setValues({
              ...values,
              [name]: value,
            })
    }
}
    //when the admin presses add student
    const handleSubmit = async (e)=>{
        e.preventDefault()
        try{
            const response = await axios.post('http://localhost:3000/auth/registerStudent',values)
            console.log(response.message)
                       
        }catch(err){
            console.log(err)
        }
 
    } 
    return(
        <div>Register Student
            <div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='studentId'>Student Id</label>
                        <input type='text' placeholder="Student's Id"
                        name="studentId" onChange={handleChanges}/>
                    </div>
                    
                    <div>
                        <label htmlFor='studentName'>Student Name</label>
                        <input type='text' placeholder="Student's name"
                        name="studentName" onChange={handleChanges}/>
                    </div>
                    <div>
                        <label htmlFor='studentAddress'>Student Address</label>
                        <input type='text' placeholder="Student's address"
                        name="studentAddress" onChange={handleChanges}/>

                    </div>
                    <div>
                        <label htmlFor='studentEmail'>Student Email</label>
                        <input type='email' placeholder="Student's email"
                        name="studentEmail" onChange={handleChanges}/>

                    </div>
                    <div>
                        <label htmlFor='studentDOB'>Student DOB</label>
                        <input type='date' placeholder="Student's DOB"
                        name="studentDOB" onChange={handleChanges}/>

                    </div>

                    <button> Add student</button>
                </form>
                {errorMessage}
            </div>
        </div>
    )
}

export default Register