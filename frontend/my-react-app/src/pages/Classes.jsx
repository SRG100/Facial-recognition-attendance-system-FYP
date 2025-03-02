import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'

const Classes = ({ isLoggedIn, userRole, userId }) => {
    const [scheduledClasses, setScheduledClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (userId) {
            getClassDetails();
        }
    }, [userId, userRole]);

    const isClassLive = (startTime, endTime) => {
        const now = new Date();

        const currentTime = now.toTimeString().split(" ")[0];

        return currentTime >= startTime && currentTime <= endTime;
    };


    const getClassDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/classes/scheduledClass?userId=${userId}&userRole=${userRole}`);
            setScheduledClasses(Array.isArray(response.data) ? response.data : []);

            // setScheduledClasses(response.data);

        } catch (error) {
            console.error('Error while getting the scheduled Classes:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        console.log("Updated schedules class:", scheduledClasses);
    }, [scheduledClasses])

    if (loading) {
        return (
            <div>Loading...</div>)
    }
    return (
        <div>Classes
            The classes of the {userRole} are as follows:
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">

                        <tr>
                            <th scope="col" className="px-6 py-3">Module Name </th>
                            <th scope="col" className="px-6 py-3">Class Start Time </th>
                            <th scope="col" className="px-6 py-3">Class End Time </th>
                            <th scope="col" className="px-6 py-3">Class Type </th>
                            <th scope="col" className="px-6 py-3">Class Day </th>
                            {userRole === "student" ? (
                                <th scope="col">Teacher Name</th>
                            ) : (<th scope="col">Section Name</th>)}
                            <th scope="col" className="px-6 py-3">
                                <span className="sr-only"> Class </span>
                            </th>
                        </tr>

                    </thead>
                    <tbody>
                        {
                            scheduledClasses.map((classDetail, i) => {
                                return (
                                    <tr key={i}>
                                        <td className="px-6 py-4">{classDetail.Module_Name}</td>
                                        <td className="px-6 py-4">{classDetail.Class_Start_Time}</td>
                                        <td className="px-6 py-4">{classDetail.Class_End_Time}</td>
                                        <td className="px-6 py-4">{classDetail.Class_Type}</td>
                                        <td className="px-6 py-4">{classDetail.Class_Day}</td>
                                        {userRole === "student" ? (
                                            <td scope="col">{classDetail.Teacher_Name}</td>
                                        ) : (<th scope="col">Section Name</th>)}
                                        {userRole === "student" ? (
                                            <td class="px-6 py-4 text-right">
                                                <button href="#" class="font-medium text-blue-600 dark:text-blue-500 ">Join Class</button>
                                            </td>) : (<td class="px-6 py-4 text-right">
                                                {isClassLive(classDetail.Class_Start_Time, classDetail.Class_End_Time) ? (
                                                    <button className="font-medium text-blue-600 dark:text-blue-500">Start Class</button>
                                                ) : (
                                                    <span className="text-gray-400">Class not started</span>
                                                )}                                
                                                            </td>)}



                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>



        </div>

    )
}

export default Classes