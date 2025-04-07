import React, { useState, useEffect } from 'react'
import axios from 'axios'
import "../assets/Register.css"
import SidebarComponent from '../components/SideBar'

const Register = ({ userRole }) => {

    const [sections, setSections] = useState([])

    useEffect(() => {
        getSections()
    }, [])

    const [values, setValues] = useState({
        studentId: '',
        studentName: '',
        studentEmail: '',
        studentAddress: '',
        studentDOB: '',
        studentGender: '',
        studentPassword: '',
        section: ''
    })
    const getSections = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/sections/getSection`);
            setSections(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error while getting the student', err);
        }
    }

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
            const response = await axios.post('http://localhost:3000/students/registerStudent', values)
            console.log(response.message)

        } catch (err) {
            console.log(err)
        }

    }
    return (
        <div className='d-flex'>
            <SidebarComponent userRole={userRole} />
            <div className='home-section'>
            <div className="container-fluid px-1 py-3 mx-auto flex-grow-1">
                <div className="row d-flex justify-content-center">
                    <div className="col-xl-7 col-lg-8 col-md-9 col-11 ">
                        <div className="card shadow">
                            <div className="card-header bg-primary text-white p-2 text-center">
                                <h5 className="text-center m-0">Register Students</h5>
                            </div>

                            <form className="form-card mt-4" onSubmit={handleSubmitStudent}>
                                <div className="row justify-content-between mb-3">
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-label fw-bold">Student Id <span className="text-danger"> *</span></label>
                                        <input type="text" placeholder="Enter the Student's Id name" name="studentId" onChange={handleChanges} />
                                    </div>
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-label fw-bold">Student Name<span className="text-danger"> *</span></label>
                                        <input type="text"  name="studentName" placeholder="Enter the students name" onChange={handleChanges} />
                                    </div>
                                </div>
                                <div className="row justify-content-between mb-3">
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-label fw-bold">Student's Loaction<span className="text-danger"> *</span></label>
                                        <input type="text" name="studentAddress" onChange={handleChanges} placeholder="Student's Location" />
                                    </div>
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-label fw-bold">Student's Email<span className="text-danger"> *</span></label>
                                        <input type="text" placeholder="Student's email" name="studentEmail" onChange={handleChanges} />
                                    </div>
                                </div>
                                <div className="row justify-content-between mb-3">
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-label fw-bold">Student's DOB<span className="text-danger"> *</span></label>
                                        <input type='date' placeholder="Student's DOB" name="studentDOB" onChange={handleChanges} />
                                    </div>
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-label fw-bold">Student's Section<span className="text-danger"> *</span></label>
                                        <select name="section" onChange={handleChanges}>
                                        <option value="">-- Select a Section --</option>
                                        {sections.map((section) => (
                                            <option key={section.Section_id}  value={section.Section_id} >
                                                {section.Section_id}
                                            </option>
                                        ))}
                                    </select>    
                                </div>
                                </div>
                                <div className="row justify-content-between mb-3">
                                    
                                    <div className="form-group col-sm-6 flex-column d-flex">
                                        <label className="form-label fw-bold">Student's Gender<span className="text-danger"> *</span></label>
                                        <select name="studentGender" onChange={handleChanges}>
                                        <option value="">-- Select Gender --</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>    
                                </div>
                                </div>

                                <div className="row justify-content-end">
                                    <div className="form-group mt-4"> <button type="submit" className="btn btn-primary">Add Student</button> </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            

        </div>
    )
}

export default Register