import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'


const Classes = ({ isLoggedIn, userRole, userId }) => {
    const [scheduledClasses, setScheduledClasses] = useState([])
    const [classCode, setClassCode] = useState(false)
    const [userLocationLongitude, setuserLocationLongitude] = useState(null)
    const [userLocationLatitude, setuserLocationLatitude] = useState(null)
    const [userLocation, setUserLocation] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate();
    
    // const [code,setCode]=useState(null)
    const [code, setCode] = useState({
    
            classCode: ''
        })
        const handleChanges = (e) => {
            const { name, value } = e.target
            setCode({
                ...code,
                [name]: value,
            })
        }

    useEffect(() => {
        if (userId) {
            getClassDetails();
        }
    }, [userId, userRole]);

    

    const isClassLive = (startTime, endTime) => {
        const now = new Date();
        const currentTime = now.toTimeString().split(" ")[0];
        return currentTime >= startTime && currentTime <= endTime;
    }

    const verifyClassCode = async () =>{
        try{
            const codeVerification = await axios.get(`http://localhost:3000/location/locationVerification?Class_Id=${Class_Id}&studentClassCode=${studentClassCode}`)
            console.log("The code entered by student is:",code.classCode)
        
        }catch(err){
            console.log("Error while verifying class:", err)
        }
    }

    const getUserLocation = async () => {
        setLoading(true)
    
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                console.error("Geolocation is not supported by this browser.")
                setLoading(false)
                reject(new Error("Geolocation not supported"))
                return;
            }
    
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setUserLocation({ latitude, longitude })
                    setLoading(false)
                    resolve({ latitude, longitude })
                },
                (error) => {
                    console.error("Error getting user location:", error)
                    setLoading(false)
                    reject(error)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000, 
                    maximumAge: 0 
                }
            )
        })
    }

    const startClass = async (classDetail) => {
        try {
            const teacherLocation = await getUserLocation()
            console.log("The user location is :", teacherLocation)
            const startClassData = {
                
                Section_Id: classDetail.Section_Id,
                Class_Id: classDetail.Class_Id,
                teacherLocation:teacherLocation
            }
            const response = await axios.post('http://localhost:3000/classes/startAttendance', startClassData)
            const classCode =response.data.classCode

            console.log(classCode)
            if (response.data.classCode) {
                alert(`The class code is: ${classCode}`);
                
            }
            console.log("The user location is :", teacherLocation)
            window.location.reload()
        } catch (err) {
            console.log(err)
        }

    }

    const joinClass = async (classDetail) => {
        try {   
           
            const attendanceData = {
                Module_id: classDetail.Module_Id,
                Academic_Year_id: classDetail.Academic_Year_id,
                Course_id: classDetail.Course_id,
                Teacher_Id: classDetail.Teacher_Id,
                Section_Id: classDetail.Section_Id,
                Class_Id: classDetail.Class_Id,
                Student_Id: userId
            }
            const Class_Id=classDetail.Class_Id
            const response = await axios.post('http://localhost:3000/classes/markAttendance', attendanceData)
            console.log(response.message)
            const Attendance_id= response.data.Attendance_Id
            
            navigate("/verifycode",{state:{Class_Id, Attendance_id}})

        } catch (err) {
            console.log(err)
        }

    }

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
            {classCode && (
                <div>
                {/* <form >  */}
                <div>
                        <label htmlFor='email'>Enter Class Code </label>
                        <input type='text' placeholder="Class Code"  onChange={handleChanges}
                            name="classCode" />
                    </div>
                    <button > Submit</button>
                {/* </form> */}
                </div>
            )}

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">

                        <tr>
                            <th scope="col" className="px-6 py-3">Class Id </th>
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
                                        <td className="px-6 py-2">{classDetail.Class_Id}</td>
                                        <td className="px-6 py-4">{classDetail.Module_Name}</td>
                                        <td className="px-6 py-4">{classDetail.Class_Start_Time}</td>
                                        <td className="px-6 py-4">{classDetail.Class_End_Time}</td>
                                        <td className="px-6 py-4">{classDetail.Class_Type}</td>
                                        <td className="px-6 py-4">{classDetail.Class_Day}</td>
                                        {userRole === "student" ? (
                                            <td scope="col">{classDetail.Teacher_Name}</td>
                                        ) : (<th scope="col">{classDetail.Section_Id}</th>)}
                                        {userRole === "student" ? (
                                            <td className="px-6 py-4 text-right">
                                                {classDetail.Class_Status === 1 ? (
                                                    <button className="font-medium text-blue-600 dark:text-blue-500" onClick={() => joinClass(classDetail)}>Join Class</button>
                                                ) : (
                                                    <span className="text-gray-400">Class not started</span>
                                                )}

                                            </td>) : (<td className="px-6 py-4 text-right">
                                                {classDetail.Class_Status === 1 ? (
                                                    <button className="font-medium text-blue-600 dark:text-blue-500">Class Ongoing</button>
                                                ) : (
                                                    <button className="font-medium text-blue-600 dark:text-blue-500" onClick={() => startClass(classDetail)}>Start Class</button>
                                                )}

                                                {/* 
                                                {isClassLive(classDetail.Class_Start_Time, classDetail.Class_End_Time) ? (
                                                    <button className="font-medium text-blue-600 dark:text-blue-500" onClick={startClass}>Start Class</button>
                                                ) : (
                                                    <span className="text-gray-400">Class not started</span>
                                                )} */}
                                            </td>)}

                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>

            </div>
            {userLocation && (
                <div>
                    <h2>User Location</h2>
                    <p>Latitude: {userLocation.latitude}</p>
                    <p>Longitude: {userLocation.longitude}</p>
                    <div>
                        <h2>User Location from single</h2>
                        <p>Latitude: {userLocationLatitude}</p>
                        <p>Longitude: {userLocationLongitude}</p>
                    </div>
                </div>

            )}

        </div>

    )
}

export default Classes