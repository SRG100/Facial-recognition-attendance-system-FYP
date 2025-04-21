import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Popup from 'reactjs-popup';
import { useNavigate } from 'react-router-dom'
import SidebarComponent from '../components/SideBar'
import toast from 'react-hot-toast'
import ComponentCard from '../components/ComponentCard.jsx'
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb.jsx'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';



const Classes = ({ userRole, userId, userName }) => {
    const [scheduledClasses, setScheduledClasses] = useState([])
    const [completedClass, setCompletedClass] = useState([])
    const [teachers, setTeachers] = useState([])
    const [sections, setSections] = useState([]);
    const [modules, setModules] = useState([])
    const [newClass, setNewClass] = useState({ Class_Start_Time: '', Class_End_Time: '', Class_Date: '', Class_Type: '', Section_Id: '', Module_Id: '', Teacher_Id: '', userRole: userRole });
    const [showCompletedClasses, setShowCompletedClasses] = useState(false)
    const [minTime, setMinTime] = useState('');
    const [minDate, setMinDate] = useState('');

    const [isPopupOpen, setIsPopupOpen] = useState(false)
    const [attendnaceExists, setAttendanceExists] = useState(false)


    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        if (userId) {
            getClassDetails()
        }
    }, [userId, userRole])



    useEffect(() => {
        if (userRole === 'teacher') {
            setNewClass(prev => ({ ...prev, Teacher_Id: userId }));
        }
    }, [userRole])

    useEffect(() => {
        if (userId) {
            getModuleDetails()
            getTeacherDetails()
            getSectionDetails()

        }
    }, [userId])

    const endClass = async (classDetail) => {
        try {
            const endClassData = { Class_Id: classDetail.Class_Id }
            const response = await axios.post('http://localhost:3000/classes/endClass', endClassData)
            toast.success(response.data.message)
            getClassDetails()

        } catch (e) {
            console.error('Error while getting the sections', e)
            toast.error("Error getting the sections")
        }
    }

    const getSectionDetails = async () => {
        try {
            const response = await axios.get('http://localhost:3000/sections/getSection')
            setSections(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            toast.error('Error while getting the sections', error)
        }
    }
    function formatDate(dateString) {
        const targetDate = new Date(dateString);
        return targetDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    }

    const getModuleDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/modules/getModulesDetails?userId=${userId}&userRole=${userRole}`)
            setModules(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error('Error while getting the modules', error)
            toast.error("Error while getting modules")
        }
    }
    const getTeacherDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/teachers/getTeacherDetail?userId=${userId}&userRole=${userRole}`)
            setTeachers(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error('Error while getting the teachers', error)
            toast.error("Error while getting tecahers")
        }
    }
    useEffect(() => {
        const today = new Date()
        const yyyy = today.getFullYear()

        const mm = String(today.getMonth() + 1).padStart(2, '0')
        const dd = String(today.getDate()).padStart(2, '0')
        setMinDate(`${yyyy}-${mm}-${dd}`)

        const hours = String(today.getHours()).padStart(2, '0')
        const minutes = String(today.getMinutes()).padStart(2, '0')
        setMinTime(`${hours}:${minutes}`)
    }, [])



    const addNewClass = async (e) => {

        console.log("Well the data before sending is :", newClass)
        e.preventDefault()
        try {
            const response = await axios.post(`http://localhost:3000/classes/addClass`, newClass)
            console.log(response.data.message)
            if (response.data.success) {
                toast.success(response.data.message)

            } else {
                toast.error(response.data.message)
            }
            getClassDetails()
            setIsPopupOpen(false)

        } catch (error) {
            console.error('Error while adding new class ', error)
            toast.error("Error while adding new class")

        }
    }

    const handleChanges = (e) => {

        const { name, value } = e.target;
        setNewClass(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    useEffect(() => {
        const interval = setInterval(() => {
            getClassDetails()
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const getMinEndTime = () => {
        const { Class_Date, Class_Start_Time } = newClass
        if (Class_Start_Time) {
            const start = new Date(`${Class_Date}T${Class_Start_Time}`)
            const minEnd = new Date(start.getTime() + 60 * 60 * 1000)
            const hours = minEnd.getHours().toString().padStart(2, '0');
            const minutes = minEnd.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        return Class_Date === minDate ? minTime : undefined
    }

    const isClassLive = (classDetail) => {
        const { Class_Date: classDateISO, Class_Start_Time: startTime, Class_End_Time: endTime } = classDetail;

        const now = new Date();
        const todayNPT = now.toISOString().split("T")[0]
        const classDateUTC = new Date(classDateISO)
        const classDateNPT = new Date(classDateUTC.getTime() + (5 * 60 + 45) * 60 * 1000)
        const classDateOnly = classDateNPT.toISOString().split("T")[0]
        if (classDateOnly !== todayNPT) {
            return false
        }
        const currentTime = now.toTimeString().split(" ")[0]
        const isActive = currentTime >= startTime && currentTime <= endTime
        if (!isActive && currentTime > endTime &&
            classDetail.Class_Status === 1 && classDetail.Class_Completion === 0) {
            console.log(`Auto-ending expired class: ${classDetail.Class_Id}`)
            endClass(classDetail)
        }
        return isActive
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

                    setLoading(false)
                    resolve({ latitude, longitude })
                },
                (error) => {
                    toast.error("Error getting user location:", error)
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
            toast.loading("Getting your location...")

            const teacherLocation = await getUserLocation()
            console.log("The user location is :", teacherLocation)

            toast.dismiss()

            const startClassData = {
                Section_Id: classDetail.Section_Id,
                Class_Id: classDetail.Class_Id,
                teacherLocation: teacherLocation
            }
            toast.loading("Starting class...")

            const response = await axios.post('http://localhost:3000/classes/startAttendance', startClassData)
            const classCode = response.data.classCode
            console.log(classCode)

            toast.dismiss();

            if (response.data.classCode) {
                toast.success(`Class started! The class code is: ${classCode}`);
            }

            getClassDetails();
        } catch (err) {
            toast.dismiss(); // Dismiss any loading toasts
            toast.error("Failed to start class: " + (err.message || "Unknown error"));
            console.log(err);
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
            const Class_Id = classDetail.Class_Id
            const response = await axios.post('http://localhost:3000/classes/markAttendance', attendanceData)
            console.log(response.message)
            const Attendance_id = response.data.Attendance_Id
            const attendnaceExistance = response.data.attendanceExists
            setAttendanceExists(response.data.attendanceExists)
            if (attendnaceExistance) {
                toast.error(response.data.message)

            }
            else {
                navigate("/verifycode", { state: { Class_Id, Attendance_id, fromNavigate: true } })
            }
        } catch (err) {
            console.log(err)
        }

    }

    const getClassDetails = async () => {
        try {
            const upcomingClass = await axios.get(`http://localhost:3000/classes/scheduledClass?userId=${userId}&userRole=${userRole}`);

            setScheduledClasses(Array.isArray(upcomingClass.data) ? upcomingClass.data : []);
            const response = await axios.get(`http://localhost:3000/classes/completedClass?userId=${userId}&userRole=${userRole}`);
            setCompletedClass(Array.isArray(response.data) ? response.data : [])

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
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        );
      }
      
    return (
        <div>
            <SidebarComponent userRole={userRole} />

            <div className='home-section'>
                <Header userName={userName} userRole={userRole} />
                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                    <Breadcrumb pageTitle="Classes" />

                    <div className="space-y-6">
                        <ComponentCard title="Ongoing Class" className="mt-6">
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                                <div className="max-w-full overflow-x-auto">
                                    <table className="min-w-full divide-y">
                                        <thead className=" ">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Class ID
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Module Name
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Class Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Start Time
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    End Time
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Day
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {userRole === "student" ? "Teacher Name" : "Section Name"}
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                                {userRole === "teacher" && (
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                        Class Code
                                                    </th>
                                                )}
                                            </tr>

                                        </thead>

                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                            {scheduledClasses.map((classDetail, i) => (
                                                <tr
                                                    key={i}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                                                >
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        {classDetail.Class_Id}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {classDetail.Module_Name}
                                                    </td>

                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {formatDate(classDetail.Class_Date)}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {classDetail.Class_Start_Time}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {classDetail.Class_End_Time}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {classDetail.Class_Type}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {classDetail.Class_Day}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {userRole === "student" ? classDetail.Teacher_Name : classDetail.Section_Id}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                        {userRole === "student" ? (
                                                            <>
                                                                {classDetail.Class_Status === 1 && classDetail.Class_Completion === 0 ? (
                                                                    <button
                                                                        onClick={() => joinClass(classDetail)}
                                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                                                                    >
                                                                        Join Class
                                                                    </button>
                                                                ) : classDetail.Class_Completion === 1 ? (
                                                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-100">
                                                                        Class Completed
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100">
                                                                        Class Not Started
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : userRole === "teacher" ? (
                                                            <>
                                                                {isClassLive(classDetail) ? (
                                                                    <>
                                                                        {classDetail.Class_Status === 1 && classDetail.Class_Completion === 0 ? (
                                                                            <button
                                                                                onClick={() => endClass(classDetail)}
                                                                                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800 transition-colors duration-150"
                                                                            >
                                                                                End Class
                                                                            </button>
                                                                        ) : classDetail.Class_Status === 0 && classDetail.Class_Completion === 1 ? (
                                                                            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-100">
                                                                                Class Cancelled
                                                                            </span>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => startClass(classDetail)}
                                                                                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                                                                            >
                                                                                Start Class
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                                                                        Class Not Started
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {classDetail.Class_Status === 1 && classDetail.Class_Completion === 0 ? (
                                                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-100">
                                                                        Class Ongoing
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300">
                                                                        No Class Yet
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {userRole === "teacher" ? (
                                                            classDetail.Class_Code ? (
                                                                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                                    {classDetail.Class_Code}
                                                                </span>
                                                            ) : (
                                                                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">N/A</span>
                                                            )
                                                        ) : null}
                                                    </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                </div>
                            </div>
                            {(userRole === 'admin' || userRole === 'teacher') && (
                                <button type="button"
                                    class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                                    onClick={() => setIsPopupOpen(true)}

                                >

                                    Add Class</button>

                            )}

                        </ComponentCard>
                    </div>
                    <div className="space-y-6  relative top-10">
                        <ComponentCard title="Completed Classes" className="mt-6">
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                                <div className="max-w-full overflow-x-auto">
                                    <table className="min-w-full divide-y">
                                        <thead className=" ">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Class ID
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Module Name
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Class Date
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Start Time
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    End Time
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Day
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    {userRole === "student" ? "Teacher Name" : "Section Name"}
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                                            {completedClass.map((classDetail, i) => (
                                                <tr
                                                    key={i}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                                                >
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        {classDetail.Class_Id}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {classDetail.Module_Name}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {formatDate(classDetail.Class_Date)}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {classDetail.Class_Start_Time}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {classDetail.Class_End_Time}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {classDetail.Class_Type}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {classDetail.Class_Day}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {userRole === "student" ? classDetail.Teacher_Name : classDetail.Section_Id}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                                        {userRole === "student" ? (
                                                            <>
                                                                {classDetail.Class_Status === 1 && classDetail.Class_Completion === 0 ? (
                                                                    <button
                                                                        onClick={() => joinClass(classDetail)}
                                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                                                                    >
                                                                        Join Class
                                                                    </button>
                                                                ) : classDetail.Class_Completion === 1 ? (
                                                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-100">
                                                                        Class Completed
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-100">
                                                                        Class Cancelled
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : userRole === "teacher" ? (
                                                            <>
                                                                {classDetail.Class_Status === 1 && classDetail.Class_Completion === 0 ? (
                                                                    <button
                                                                        onClick={() => endClass(classDetail)}
                                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800 transition-colors duration-150"
                                                                    >
                                                                        End Class
                                                                    </button>
                                                                ) : classDetail.Class_Status === 0 && classDetail.Class_Completion === 1 ? (
                                                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-100">
                                                                        Class Cancelled
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => navigate("/ViewClassAttendance", {
                                                                            state: {
                                                                                Id: classDetail.Class_Id,
                                                                                From: "class",
                                                                                fromNavigate: true
                                                                            }
                                                                        })}
                                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800 transition-colors duration-150"
                                                                    >
                                                                        View Attendance
                                                                    </button>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <>
                                                                {classDetail.Class_Status === 1 ? (
                                                                    <button
                                                                        onClick={() => navigate("/ViewClassAttendance", {
                                                                            state: {
                                                                                Id: classDetail.Class_Id,
                                                                                From: "class",
                                                                                fromNavigate: true
                                                                            }
                                                                        })}
                                                                        className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800 transition-colors duration-150"
                                                                    >
                                                                        View Attendance
                                                                    </button>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-100">
                                                                        Class Cancelled
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </ComponentCard>
                    </div>
                </div>



            </div>
            <Popup
                open={isPopupOpen}
                closeOnDocumentClick
                onClose={() => setIsPopupOpen(false)}
            >
                <div className="fixed inset-0 z-50 flex items-center justify-center  transition-opacity duration-300">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 sm:mx-auto overflow-hidden animate-fade-in">
                        <form onSubmit={addNewClass} className="flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                                <h3 className="text-xl font-semibold text-gray-800">Add New Class</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsPopupOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="overflow-y-auto px-6 py-4 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Date</label>
                                    <input
                                        type="date"
                                        required
                                        min={minDate}
                                        name="Class_Date"
                                        onChange={handleChanges}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Start Time</label>
                                    <input
                                        type="time"
                                        required
                                        name="Class_Start_Time"
                                        onChange={handleChanges}
                                        min={newClass.Class_Date === minDate ? minTime : undefined}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class End Time</label>
                                    <input
                                        type="time"
                                        required
                                        min={getMinEndTime()}
                                        name="Class_End_Time"
                                        onChange={handleChanges}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Type</label>
                                    <select
                                        required
                                        name="Class_Type"
                                        onChange={handleChanges}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="">-- Select a Class Type --</option>
                                        <option value="Lecture">Lecture</option>
                                        <option value="Tutorial">Tutorial</option>
                                        <option value="Lab">Lab</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                    <select
                                        required
                                        name="Section_Id"
                                        onChange={handleChanges}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        <option value="">-- Select a Section --</option>
                                        {sections.map((section) => (
                                            <option key={section.Section_id} value={section.Section_id}>
                                                {section.Section_id}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {userRole === "admin" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                                            <select
                                                required
                                                name="Module_Id"
                                                onChange={handleChanges}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="">-- Select a Module --</option>
                                                {modules.map((module) => (
                                                    <option key={module.Module_id} value={module.Module_id}>
                                                        {module.Module_id}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Teacher */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                                            <select
                                                required
                                                name="Teacher_Id"
                                                onChange={handleChanges}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="">-- Select a Teacher --</option>
                                                {teachers.map((teacher) => (
                                                    <option key={teacher.Teacher_id} value={teacher.Teacher_id}>
                                                        {teacher.Teacher_Name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0">
                                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
                                >
                                    Add Class
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Popup>

        </div>

    )
}

export default Classes