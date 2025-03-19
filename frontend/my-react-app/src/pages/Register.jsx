import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import "../assets/Register.css"
import SidebarComponent from '../components/SideBar'
const Register = ({userRole}) => {

    const errorMessage = ''
    const [values, setValues] = useState({
        studentId: '',
        studentName: '',
        studentEmail: '',
        studentAddress: '',
        studentDOB: '',
        studentGender: '',
        studentPassword: ''
    })

    const handleChanges = (e) => {
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
    const handleSubmitStudent = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post('http://localhost:3000/auth/registerStudent', values)
            console.log(response.message)

        } catch (err) {
            console.log(err)
        }

    }
    return (
        <div>
            <SidebarComponent userRole={userRole}/>
            <div className="container-fluid px-1 py-5 mx-auto">
                <div className="row d-flex justify-content-center">
                    <div className="col-xl-7 col-lg-8 col-md-9 col-11 text-center">
                        <div className="card">
                            <h5 className="text-center mb-4">Register Students</h5>
                            <form className="form-card" onSubmit={handleSubmitStudent}>
                                <div className="row justify-content-between text-left">
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-control-label px-3">Student Id <span className="text-danger"> *</span></label>
                                        <input type="text" placeholder="Enter the Student's Id name" name="studentId" onChange={handleChanges} />
                                    </div>
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-control-label px-3">Student Name<span className="text-danger"> *</span></label>
                                        <input type="text" name="studentName" placeholder="Enter the students name" onChange={handleChanges} />
                                    </div>
                                </div>
                                <div className="row justify-content-between text-left">
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-control-label px-3">Student's Loaction<span className="text-danger"> *</span></label>
                                        <input type="text" name="studentAddress" onChange={handleChanges} placeholder="Student's Location" />
                                    </div>
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-control-label px-3">Student's Email<span className="text-danger"> *</span></label>
                                        <input type="text" placeholder="Student's email" name="studentEmail" onChange={handleChanges} />
                                    </div>
                                </div>
                                <div className="row justify-content-between text-left">
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-control-label px-3">Student's DOB<span className="text-danger"> *</span></label>
                                        <input type='date' placeholder="Student's DOB" name="studentDOB" onChange={handleChanges} />
                                    </div>
                                    
                                </div>

                                <div className="row justify-content-end">
                                    <div className="form-group col-sm-6"> <button type="submit" className="btn btn-outline-primary">Add Student</button> </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Register