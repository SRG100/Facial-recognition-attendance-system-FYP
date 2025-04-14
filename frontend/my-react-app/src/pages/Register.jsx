import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import "../assets/Register.css"
import SidebarComponent from '../components/SideBar'
import PageNotFound from '../components/PageNotFound'
import Header from '../components/Header'
import ComponentCard from '../components/ComponentCard'
import Breadcrumb from '../components/Breadcrumb'
import toast from 'react-hot-toast'

const Register = ({ userRole, userName }) => {

    if (userRole === "student" || userRole === "teacher") {
        return <PageNotFound />
    }

    const [sections, setSections] = useState([])
    const navigate = useNavigate()

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
            if (response.data.success) {
                toast.success(response.data.message)
                navigate('/viewStudents')
            }
            else {
                toast.error(response.data.message)
            }
            setValues({
                studentId: '',
                studentName: '',
                studentEmail: '',
                studentAddress: '',
                studentDOB: '',
                studentGender: '',
                studentPassword: '',
                section: ''
            })

        } catch (err) {
            console.log(err)
        }

    }
    return (
        <div className='d-flex'>
            <SidebarComponent userRole={userRole} />
            <div className='home-section'>
                <Header userRole={userRole} userName={userName} />
                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                    <Breadcrumb Title="Student" pageTitle="Add Student" />
                    <div className="space-y-6">
                        <ComponentCard title="Register Student" className="mt-6">


                            <form className="mt-4" onSubmit={handleSubmitStudent}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                                    <div className="flex flex-col">
                                        <label className="font-bold mb-1">Student Id <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter the Student's Id name"
                                            name="studentId"
                                            onChange={handleChanges}
                                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="font-bold mb-1">Student Name <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            name="studentName"
                                            placeholder="Enter the students name"
                                            onChange={handleChanges}
                                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                                    <div className="flex flex-col">
                                        <label className="font-bold mb-1">Student's Location <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            name="studentAddress"
                                            onChange={handleChanges}
                                            placeholder="Student's Location"
                                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="font-bold mb-1">Student's Email <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Student's email"
                                            name="studentEmail"
                                            onChange={handleChanges}
                                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                                    <div className="flex flex-col">
                                        <label className="font-bold mb-1">Student's DOB <span className="text-red-500">*</span></label>
                                        <input
                                            type='date'
                                            required
                                            placeholder="Student's DOB"
                                            name="studentDOB"
                                            onChange={handleChanges}
                                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="font-bold mb-1">Student's Section <span className="text-red-500">*</span></label>
                                        <select
                                            required
                                            name="section"
                                            onChange={handleChanges}
                                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- Select a Section --</option>
                                            {sections.map((section) => (
                                                <option key={section.Section_id} value={section.Section_id}>
                                                    {section.Section_id}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                                    <div className="flex flex-col">
                                        <label className="font-bold mb-1">Student's Gender <span className="text-red-500">*</span></label>
                                        <select
                                            name="studentGender"
                                            onChange={handleChanges}
                                            required
                                            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">-- Select Gender --</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-6">
                                    <button
                                        type="submit"
                                        className="focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                                    >
                                        Add Student
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

export default Register