import React, { useState, useEffect } from 'react';
import SidebarComponent from '../components/SideBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Teachers = ({ userRole, userId }) => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);

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
    };

    return (
        <div>
            <SidebarComponent userRole={userRole} />
            <div className='home-section'>
            <h3 className="m-0 mb-3  text-start">Teachers</h3>

                <div className="card container p-0 m-0">
                    <table className="table  table-hover text-center table-responsive">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col">Teacher ID</th>
                                <th scope="col">Teacher Name</th>
                                {userRole === "admin" ? (
                                    <>
                                        <th scope="col">Module ID</th>
                                        <th scope="col">Courses</th>
                                        <th scope="col">Sections</th>
                                    </>
                                ) : (
                                    <>
                                        <th scope="col">Email</th>
                                        <th scope="col">Gender</th>
                                        <th scope="col">Section</th>
                                    </>
                                )}
                                <th scope="col">Review</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((teacher, i) => (
                                <tr key={i}>
                                    <td className="align-middle">{teacher.Teacher_id}</td>
                                    <td className="align-middle">{teacher.Teacher_Name}</td>
                                    {userRole === "admin" ? (
                                        <>
                                            <td className="align-middle">
                                                {teacher.Module_id=="Not Assigned" ? (
                                                    <>Not Assigned</>
                                                ):(
                                                    <>
                                                    {teacher.Module_Name} ( 
                                                        {teacher.Module_id} 
                                                    )
                                                    </>
                                                    
                                                )}
                                                </td>
                                            <td className="align-middle">{teacher.Courses}</td>
                                            <td className="align-middle">{teacher.Sections}</td>
                                            <td className="align-middle">
                                                <button className="btn btn-outline-warning" onClick={() => navigate("/ViewReview", { state: { Id: teacher.Teacher_id, ReviewOf: "Teacher" } })}>View Reviews</button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="align-middle">{teacher.Teacher_Email}</td>
                                            <td className="align-middle">{teacher.Teacher_Gender}</td>
                                            <td className="align-middle">{teacher.Section_id}</td>
                                            <td className="align-middle">
                                                <button className="btn btn-outline-warning" onClick={() => navigate("/ReviewForm", { state: { Id: teacher.Teacher_id, ReviewOf: "Teacher" } })}>Review Teacher</button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {userRole === "admin" && (
                    <button className="btn btn-success mt-3" onClick={() => navigate("/RegisterTeacher")}>Add Teacher</button>
                )}
                </div>
                
            </div>
        </div>
    );
};

export default Teachers;
