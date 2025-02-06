import React, {useState} from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
const Register=()=>{
    const [values,setValues]=useState({
        studentId:'',
        studentName:'',
        studentEmail:'',
        studentAddress:'',
        studentDOB:'',
        studentPassword:'',
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
    const handleSubmit = async (e)=>{
        e.preventDefault()
        try{
            const response = await axios.post('http://localhost:3000/auth/register',values)
            console.log(response)

        }catch(err){
            console.log(err)
        }

    }
    return(
        <div>Register Student
            <div>
                <form action={handleSubmit}>
                    <div>
                        <label htmlFor='studentId'>Student Id</label>
                        <input type='text' placeholder="Student's Id"
                        name="studentId" oncChange={handleChanges}/>
                    </div>
                    
                    <div>
                        <label htmlFor='studentName'>Student Name</label>
                        <input type='text' placeholder="Student's name"
                        name="studentName" oncChange={handleChanges}/>
                    </div>
                    <div>
                        <label htmlFor='studentAddress'>Student Address</label>
                        <input type='text' placeholder="Student's address"
                        name="studentAddress" oncChange={handleChanges}/>

                    </div>
                    <div>
                        <label htmlFor='studentEmail'>Student Email</label>
                        <input type='email' placeholder="Student's email"
                        name="studentEmail" oncChange={handleChanges}/>

                    </div>
                    <div>
                        <label htmlFor='studentDOB'>Student DOB</label>
                        <input type='date' placeholder="Student's DOB"
                        name="studentDOB" oncChange={handleChanges}/>

                    </div>

                    <button> Add student</button>
                </form>
               
            </div>
        </div>
    )
}

export default Register