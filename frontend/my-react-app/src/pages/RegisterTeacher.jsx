import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Nav from '../components/Nav'
import SidebarComponent from '../components/SideBar'
const RegisterTeacher = ({userRole}) => {

    
    const [teacherValues, setTeacherValues] = useState({
        teacherId: '',
        teacherName: '',
        teacherEmail: '',
        teacherAddress: '',
        teacherDOB: '',
        teacherGender: '',

        teacherPassword: ''
    })

    const handleChangesTeacher = (e) => {
        const { name, value } = e.target
        if (name === 'teacherDOB') {

            setTeacherValues({
                ...teacherValues,
                [name]: value,
                teacherPassword: value,
            })
        }
        else {
            setTeacherValues({
                ...teacherValues,
                [name]: value,
            })
        }
    }

    const handleSubmitTeacher = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post('http://localhost:3000/teachers/registerTeacher', teacherValues)
            console.log(response.message)

        } catch (err) {
            console.log(err)
        }

    }
    return (
        <div>
            <SidebarComponent userRole={userRole}/>
<div className=''></div>
            <div className="container-fluid px-1 py-5 mx-auto">
                <div className="row d-flex justify-content-center">
                    <div className="col-xl-7 col-lg-8 col-md-9 col-11 text-center">
                        <div className="card">
                            <h5 className="text-center mb-4">Register Teacher</h5>
                            <form className="form-card" onSubmit={handleSubmitTeacher}>
                                <div className="row justify-content-between text-left">
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-control-label px-3">Teacher Id <span className="text-danger"> *</span></label>
                                        <input type="text" placeholder="Teacher's Id" name="teacherId" value={teacherValues.teacherId} onChange={handleChangesTeacher} />
                                    </div>
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-control-label px-3">Teacher Name<span className="text-danger"> *</span></label>
                                        <input type="text" placeholder="Teacher's name" name="teacherName" value={teacherValues.teacherName} onChange={handleChangesTeacher} />
                                    </div>
                                </div>
                                <div className="row justify-content-between text-left">
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-control-label px-3">Teacher's Loaction<span className="text-danger"> *</span></label>
                                        <input type="text" placeholder="teacher's address" name="teacherAddress" value={teacherValues.teacherAddress} onChange={handleChangesTeacher} />
                                    </div>
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-control-label px-3">Teacher's Email<span className="text-danger"> *</span></label>
                                        <input type='email' placeholder="Teacher's email" name="teacherEmail" value={teacherValues.teacherEmail} onChange={handleChangesTeacher} />
                                    </div>
                                </div>
                                <div className="row justify-content-between text-left">
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-control-label px-3">Student's DOB<span className="text-danger"> *</span></label>
                                        <input type='date' placeholder="Teacher's DOB" name="teacherDOB" value={teacherValues.teacherDOB} onChange={handleChangesTeacher} />
                                    </div>
                                    <label htmlFor='teacherGender'>Teacher Gender</label>
                                    <input type="radio" name="teacherGender" value="Male" onChange={handleChangesTeacher} /> Male
                                    <input type="radio" name="teacherGender" value="Female" onChange={handleChangesTeacher} /> Female

                                    <div>


                                    </div>
                                </div>

                                <div className="row justify-content-end">
                                    <div className="form-group col-sm-6"> <button className="btn btn-outline-primary">Add Teacher</button> </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RegisterTeacher