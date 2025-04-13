import React, { useState, useEffect } from 'react';
import SidebarComponent from '../components/SideBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Breadcrumb from '../components/Breadcrumb';
import ComponentCard from '../components/ComponentCard';

const Teachers = ({ userRole, userId, userName }) => {
    const navigate = useNavigate()
    const [teachers, setTeachers] = useState([])

    useEffect(() => {
        if (userId) {
            getTeacherDetails()
        }
    }, [userId, userRole])

    const getTeacherDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/teachers/getTeacherDetail?userId=${userId}&userRole=${userRole}`)
            setTeachers(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error('Error while getting the teachers', error)
        }
    }

    return (
        <div>
            <SidebarComponent userRole={userRole} />
            <div className='home-section'>
                <Header userName={userName} userRole={userRole} />
                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                    <Breadcrumb pageTitle="Teachers" />
                    <div className="space-y-6">
                        <ComponentCard title="Teachers" className="mt-6">
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                                <div className="max-w-full overflow-x-auto">
                                    <table className="min-w-full divide-y">
                                        <thead >
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Teacher ID
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Teacher Name
                                                </th>
                                                {userRole === "admin" ? (
                                                    <>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Module ID</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Courses</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sections</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gender</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Section</th>
                                                    </>
                                                )}

                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Review
                                                </th>
                                            </tr>

                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                            {teachers.map((teacher, i) => (
                                                <tr key={i}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                                                >
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{teacher.Teacher_id}</td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{teacher.Teacher_Name}</td>
                                                    {userRole === "admin" ? (
                                                        <>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                                {teacher.Module_id == "Not Assigned" ? (
                                                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100">
                                                                        Not Assigned
                                                                    </span>
                                                                ) : (
                                                                    <>
                                                                        {teacher.Module_Name} (
                                                                        {teacher.Module_id}
                                                                        )
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                                {teacher.Courses}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{teacher.Sections}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                                <button
                                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                                                                    onClick={() => navigate("/ViewReview", { state: { Id: teacher.Teacher_id, ReviewOf: "Teacher", fromNavigate: true } })}>View Reviews</button>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{teacher.Teacher_Email}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{teacher.Teacher_Gender}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{teacher.Section_id}</td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                                <button
                                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                                                                    onClick={() => navigate("/ReviewForm", { state: { Id: teacher.Teacher_id, ReviewOf: "Teacher", fromNavigate: true } })}>Review Teacher</button>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                </div>

                            </div>
                            {userRole === "admin" && (
                                <button
                                    class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                                    onClick={() => navigate("/RegisterTeacher")}>Add Teacher</button>
                            )}

                        </ComponentCard>
                    </div>


                </div>

            </div>
        </div>
    );
};

export default Teachers;
