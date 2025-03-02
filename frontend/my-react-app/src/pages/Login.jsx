import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

// import Cookies from 'universal-cookies'
const Login = () => {

    const errorMessage = ''
    const navigate = useNavigate();

    const [values, setValues] = useState({

        email: '',
        password: '',
        role: ''
    })
    const handleChanges = (e) => {
        const { name, value } = e.target
        setValues({
            ...values,
            [name]: value,
        })

    }
    //when the admin presses add student
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post('http://localhost:3000/auth/login', values, { withCredentials: true })
            console.log("Response:", response.data);
            if (response.status === 201) {

                console.log("the token is :", response.data.token)
                console.log("sucess", response.data.redirect)
                if (response.data.redirect) {
                    alert("Login Success");
                    navigate(response.data.redirect);
                }
            }
            window.location.reload();
            console.log(response.data.message)
            // errorMessage=response.data.message

        } catch (err) {
            console.log(err)
        }

    }
    return (
        <div>Login 
            <div>
                <form onSubmit={handleSubmit}> 
                    {/* when the form is submitted */}
                    <div> 
                        {/* //for the role selection */}
                        <label htmlFor='role'>Role:</label>
                        <select name="role" value={values.role} onChange={handleChanges}>
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                        </select>

                    </div>
                    <div>
                        <label htmlFor='email'>Email Address: </label>
                        <input type='text' placeholder="Email"
                            name="email" onChange={handleChanges} />
                    </div>
                    <div>
                        <label htmlFor='password'>Password: </label>
                        <input type='password' placeholder="Password"
                            name="password" onChange={handleChanges} />

                    </div>


                    <button> Login</button>
                </form>
                {errorMessage}
            </div>
        </div>
    )
}

export default Login