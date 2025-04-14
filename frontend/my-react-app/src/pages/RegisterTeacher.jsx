import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Nav from '../components/Nav'
import SidebarComponent from '../components/SideBar'
import PageNotFound from '../components/PageNotFound'
import Header from '../components/Header'
import ComponentCard from '../components/ComponentCard'
import Breadcrumb from '../components/Breadcrumb'
import toast from 'react-hot-toast'


const RegisterTeacher = ({ userId, userRole,userName }) => {
    if (userRole === "student") {
        return <PageNotFound />
    }
    const navigate = useNavigate()

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
            console.log(response.data.message)
            if(response.data.success){
                toast.success(response.data.message)
                navigate('/viewTeachers')
            }
            else{
                toast.error(response.data.message)
            }
            setTeacherValues({teacherId: '',
                teacherName: '',
                teacherEmail: '',
                teacherAddress: '',
                teacherDOB: '',
                teacherGender: '',
                teacherPassword: '',
                teacherModule: ''})

        } catch (err) {
            console.log(err)
            toast.error("Error while registering the teacher")
        }

    }
    return (
        <div>
            <SidebarComponent userRole={userRole} />
            <div className='home-section'>
                <Header userRole={userRole} userName={userName} />
                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                    <Breadcrumb Title="Teacher" pageTitle="Add Teacher" />
                    <div className="space-y-6">
                        <ComponentCard title="Register Teacher" className="mt-6">
                            <form className="mt-4" onSubmit={handleSubmitTeacher}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                                    <div className="flex flex-col">
                                        <label className="font-bold mb-1">Teacher Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Teacher's name"
                                            name="teacherName"
                                            value={teacherValues.teacherName}
                                            onChange={handleChangesTeacher}
                                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="font-bold mb-1">Teacher's Gender <span className="text-red-500">*</span></label>
                                        <select
                                            name="teacherGender"
                                            required
                                            onChange={handleChangesTeacher}
                                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- Select Gender --</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                                    <div className="flex flex-col">
                                        <label className="font-bold mb-1">Teacher's Location <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Teacher's address"
                                            name="teacherAddress"
                                            value={teacherValues.teacherAddress}
                                            onChange={handleChangesTeacher}
                                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="font-bold mb-1">Teacher's Email <span className="text-red-500">*</span></label>
                                        <input
                                            type='email'
                                            required
                                            placeholder="Teacher's email"
                                            name="teacherEmail"
                                            value={teacherValues.teacherEmail}
                                            onChange={handleChangesTeacher}
                                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                                    <div className="flex flex-col">
                                        <label className="font-bold mb-1">Teacher's DOB <span className="text-red-500">*</span></label>
                                        <input
                                            type='date'
                                            placeholder="Teacher's DOB"
                                            required
                                            name="teacherDOB"
                                            value={teacherValues.teacherDOB}
                                            onChange={handleChangesTeacher}
                                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="font-bold mb-1">Teacher's Module <span className="text-red-500">*</span></label>
                                        <select
                                            name="teacherModule"
                                            required
                                            onChange={handleChangesTeacher}
                                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- Select a Module --</option>
                                            {modules.map((module) => (
                                                <option key={module.Module_id} value={module.Module_id}>
                                                    {module.Module_Name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-6">
                                    <button
                                        type="submit"
                                        className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                                    >
                                        Add Teacher
                                    </button>
                                </div>
                            </form>
                        </ComponentCard>
                    </div>
                </div>


            </div>

        </div>
    )
}

export default RegisterTeacher