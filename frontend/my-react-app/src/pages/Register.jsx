import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
const Register = () => {

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
    const handleSubmitTeacher = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post('http://localhost:3000/auth/registerTeacher', teacherValues)
            console.log(response.message)

        } catch (err) {
            console.log(err)
        }

    }
    return (
        <div>
            <div>Register Student
                <form onSubmit={handleSubmitStudent}>
                    <div>
                        <label htmlFor='studentId'>Student Id</label>
                        <input type='text' placeholder="Student's Id"
                            name="studentId" onChange={handleChanges} />
                    </div>

                    <div>
                        <label htmlFor='studentName'>Student Name</label>
                        <input type='text' placeholder="Student's name"
                            name="studentName" onChange={handleChanges} />
                    </div>
                    <div>
                        <label htmlFor='studentAddress'>Student Address</label>
                        <input type='text' placeholder="Student's address"
                            name="studentAddress" onChange={handleChanges} />

                    </div>
                    <div>
                        <label htmlFor='studentEmail'>Student Email</label>
                        <input type='email' placeholder="Student's email"
                            name="studentEmail" onChange={handleChanges} />

                    </div>
                    <div>
                        <label htmlFor='studentDOB'>Student DOB</label>
                        <input type='date' placeholder="Student's DOB"
                            name="studentDOB" onChange={handleChanges} />

                    </div>
                
                    <div>
                        <label htmlFor='studentGender'>Teacher Gender</label>
                        <input type="radio" name="studentGender" value="Male" onChange={handleChanges} /> Male
                        <input type="radio" name="studentGender" value="Female" onChange={handleChanges} /> Female

                    </div>

                    <button> Add student</button>
                </form>
                {errorMessage}
            </div>
            <div>Register Teacher
                <form onSubmit={handleSubmitTeacher}>

                    <div>
                        <label htmlFor='teacherId'>Teacher Id</label>
                        <input type='text' placeholder="Teacher's Id"
                            name="teacherId" value={teacherValues.teacherId} onChange={handleChangesTeacher} />
                    </div>

                    <div>
                        <label htmlFor='teacherName'>Teacher Name</label>
                        <input type='text' placeholder="Teacher's name"
                            name="teacherName" value={teacherValues.teacherName} onChange={handleChangesTeacher} />
                    </div>
                    <div>
                        <label htmlFor='teacherAddress'>Teacher Address </label>
                        <input type='text' placeholder="teacher's address"
                            name="teacherAddress" value={teacherValues.teacherAddress} onChange={handleChangesTeacher} />

                    </div>
                    <div>
                        <label htmlFor='teacherEmail'>Teacher Email</label>
                        <input type='email' placeholder="Teacher's email"
                            name="teacherEmail" value={teacherValues.teacherEmail} onChange={handleChangesTeacher} />

                    </div>
                    <div>
                        <label htmlFor='teacherDOB'>Teacher DOB</label>
                        <input type='date' placeholder="Teacher's DOB"
                            name="teacherDOB" value={teacherValues.teacherDOB} onChange={handleChangesTeacher} />

                    </div>
                    <div>
                        <label htmlFor='teacherGender'>Teacher Gender</label>
                        <input type="radio" name="teacherGender" value="Male" onChange={handleChangesTeacher} /> Male
                        <input type="radio" name="teacherGender" value="Female" onChange={handleChangesTeacher} /> Female


                    </div>

                    <button> Add Teacher</button>
                </form>
                {errorMessage}
            </div>
        </div>
    )
}

export default Register