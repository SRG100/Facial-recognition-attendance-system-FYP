import React from 'react'
import { useState, useEffect } from 'react'
import SidebarComponent from '../components/SideBar'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Teachers = ({ userRole, userId }) => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([])
    useEffect(() => {
        if (userId) {
            getTeacherDetails();
        }
    }, [userId, userRole]);


    const getTeacherDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/teachers/getTeacherDetail?userId=${userId}&userRole=${userRole}`);
            setTeachers(Array.isArray(response.data) ? response.data : []);

        } catch (error) {
            console.error('Error while getting the teachers', error);
        }
    }
    return (
        <div>Teachers
            <SidebarComponent userRole={userRole} />
            <div className="container p-0 m-0">
                <table className="table table-dark table-hover text-center table-responsive">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">

                        <tr>
                            <th scope="col" >Teacher id</th>
                            <th scope="col" >Teacher name </th>
                            {userRole == "admin" ? (
                                <>
                                    <th scope="col" >Module id </th>
                                    <th scope="col" >Courses</th>
                                    <th scope="col" >Sections </th>
                                </>
                            ) : (
                                <>
                                    <th scope="col" >Teacher Email</th>
                                    <th scope="col" >Teacher Gender</th>
                                    <th scope="col" >Section </th>

                                </>
                            )}
                            <th scope="col" >Review </th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            teachers.map((teachers, i) => {
                                return (
                                    <tr scope="row" key={i}>

                                        <td className="align-middle" >{teachers.Teacher_id}</td>
                                        <td className="align-middle">{teachers.Teacher_Name}</td>
                                        {userRole == "admin" ? (
                                            <>
                                                <td className="align-middle">{teachers.Module_id}</td>
                                                <td className="align-middle">{teachers.Courses}</td>
                                                <td className="align-middle">{teachers.Sections}</td>
                                                <td className="align-middle">
                                                    <button className="btn btn-outline-warning" > View Reviews </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="align-middle">{teachers.Teacher_Email}</td>
                                                <td className="align-middle">{teachers.Teacher_Gender}</td>
                                                <td className="align-middle">{teachers.Section_id}</td>
                                                <td className="align-middle">
                                                    <button className="btn btn-outline-warning" onClick={() => navigate("/ReviewForm", { state: { Id: teachers.Teacher_id, userRole } })}>Review Teachers</button>
                                                </td>
                                            </>
                                        )}


                                    </tr>
                                )
                            })}
                    </tbody>
                </table>
            </div>
            {userRole == "admin" && (
                // console.log("User Role:", userRole)
                <button className="btn btn-success" onClick={() => navigate("/RegisterTeacher")}>Add Teacher</button>
            )}
        </div>
    )
}

export default Teachers