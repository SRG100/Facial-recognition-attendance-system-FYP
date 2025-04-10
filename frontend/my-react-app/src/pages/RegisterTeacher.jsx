import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Nav from '../components/Nav'
import SidebarComponent from '../components/SideBar'
import PageNotFound from '../components/PageNotFound'

const RegisterTeacher = ({ userId, userRole }) => {
    if (userRole === "student" ) {
        return <PageNotFound />
    }

    const [isLoading, setIsLoading] = useState(false)

    const [teacherValues, setTeacherValues] = useState({
        teacherId: '',
        teacherName: '',
        teacherEmail: '',
        teacherAddress: '',
        teacherDOB: '',
        teacherGender: '',
        teacherPassword: '',
        teacherModule: ''
    })
    const [modules, setModule] = useState([])


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

    useEffect(() => {
        getModuleDetails();

    }, [userId, userRole]);


    const getModuleDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/modules/getModulesDetails?userId=${userId}&userRole=${userRole}`);
            setModule(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error while getting the modules', error);
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
            <SidebarComponent userRole={userRole} />
            <div className='home-section'>
                <div className="container-fluid px-1 py-5 mx-auto">
                    <div className="row d-flex justify-content-center">
                        <div className="col-xl-7 col-lg-8 col-md-9 col-11 text-center">
                            <div className="card shadow">
                                <div className="card-header bg-primary text-white p-2 text-center">
                                    <h5 className="text-center m-0">Register Teachers</h5>
                                </div>
                                <form className="form-card mt-4" onSubmit={handleSubmitTeacher}>
                                    <div className="row justify-content-between mb-3">

                                        <div className="form-group col-sm-6 flex-column d-flex">
                                            <label className="form-label fw-bold">Teacher Name<span className="text-danger"> *</span></label>
                                            <input type="text" placeholder="Teacher's name" name="teacherName" value={teacherValues.teacherName} onChange={handleChangesTeacher} />
                                        </div>
                                        <div className="form-group col-sm-6 flex-column d-flex">
                                            <label className="form-label fw-bold">Teacher's Gender<span className="text-danger"> *</span></label>
                                            <select name="teacherGender" onChange={handleChangesTeacher}>
                                                <option value="">-- Select Gender --</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="row justify-content-between text-left">
                                        <div className="form-group col-sm-6 flex-column d-flex">
                                            <label className="form-label fw-bold">Teacher's Loaction<span className="text-danger"> *</span></label>
                                            <input type="text" placeholder="teacher's address" name="teacherAddress" value={teacherValues.teacherAddress} onChange={handleChangesTeacher} />
                                        </div>
                                        <div className="form-group col-sm-6 flex-column d-flex">
                                            <label className="form-label fw-bold">Teacher's Email<span className="text-danger"> *</span></label>
                                            <input type='email' placeholder="Teacher's email" name="teacherEmail" value={teacherValues.teacherEmail} onChange={handleChangesTeacher} />
                                        </div>
                                    </div>
                                    <div className="row justify-content-between text- mt-3">
                                        <div className="form-group col-sm-6 flex-column d-flex">
                                            <label className="form-label fw-bold">Teacher's DOB<span className="text-danger"> *</span></label>
                                            <input type='date' placeholder="Teacher's DOB" name="teacherDOB" value={teacherValues.teacherDOB} onChange={handleChangesTeacher} />
                                        </div>
                                        <div className="form-group col-sm-6 flex-column d-flex">
                                            <label className="form-label fw-bold">Teacher's Module<span className="text-danger"> *</span></label>
                                            <select
                                                name="teacherModule"
                                                onChange={handleChangesTeacher}>
                                                <option value="">-- Select a Module --</option>
                                                {modules.map((module) => (
                                                    <option key={module.Module_id} value={module.Module_id}>
                                                        {module.Module_Name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                    </div>

                                    <div className="row justify-content-end mt-4">
                                        <div className="form-group"> <button className="btn btn-primary">Add Teacher</button> </div>
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

export default RegisterTeacher