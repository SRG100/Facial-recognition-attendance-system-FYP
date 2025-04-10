import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Popup from 'reactjs-popup';
import { useNavigate } from 'react-router-dom'
import SidebarComponent from '../components/SideBar'
import toast from 'react-hot-toast'



const Classes = ({ userRole, userId }) => {
    const [scheduledClasses, setScheduledClasses] = useState([])
    const [completedClass, setCompletedClass] = useState([])
    const [teachers, setTeachers] = useState([])
    const [sections, setSections] = useState([]);
    const [modules, setModules] = useState([])
    const [newClass, setNewClass] = useState({ Class_Start_Time: '', Class_End_Time: '', Class_Date: '', Class_Type: '', Section_Id: '', Module_Id: '', Teacher_Id: '' ,userRole:userRole});
    const [showCompletedClasses, setShowCompletedClasses] = useState(false);

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
            getClassDetails();

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

    const addNewClass = async (e) => {
       
        console.log("Well the data before sending is :", newClass)
        e.preventDefault()
        try {
            const response = await axios.post(`http://localhost:3000/classes/addClass`, newClass)
            console.log(response.message)
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
          const  interval = setInterval(() => {
            getClassDetails()
            }, 1000)
        
        return () => clearInterval(interval)
    }, [])


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
                navigate("/verifycode", { state: { Class_Id, Attendance_id,fromNavigate: true  } })
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
            setCompletedClass(Array.isArray(response.data) ? response.data : []);


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
        <div>
            <SidebarComponent userRole={userRole} />

            <div className='home-section'>
                <h3 className="m-0 mb-3  text-start">Classes</h3>

                <div className="card container p-0 m-0 table-responsive">

                    <table className="table table-hover text-center m-2 ">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">

                            <tr>
                                <th scope="col" >Class Id </th>
                                <th scope="col" >Module Name </th>
                                <th scope="col" >Class Start Time </th>
                                <th scope="col" >Class End Time </th>
                                <th scope="col" >Class Type </th>
                                <th scope="col" >Class Day </th>
                                {userRole === "student" ? (
                                    <th scope="col">Teacher Name</th>
                                ) : (<th scope="col">Section Name</th>)}
                                <th scope="col" >
                                    <span className="sr-only"> Class </span>
                                </th>
                            </tr>

                        </thead>
                        <tbody>
                            {
                                scheduledClasses.map((classDetail, i) => {
                                    return (

                                        <tr scope="row" key={i}>
                                            <td className="align-middle" >{classDetail.Class_Id}</td>
                                            <td className="align-middle">{classDetail.Module_Name}</td>
                                            <td className="align-middle">{classDetail.Class_Start_Time}</td>
                                            <td className="align-middle">{classDetail.Class_End_Time}</td>
                                            <td className="align-middle">{classDetail.Class_Type}</td>
                                            <td className="align-middle">{classDetail.Class_Day}</td>

                                            {userRole === "student" ? (
                                                <td className="align-middle" >{classDetail.Teacher_Name}</td>
                                            ) : (<td className="align-middle">{classDetail.Section_Id}</td>)}

                                            
                                            {userRole === "student" ? (
                                                <td >
                                                    {classDetail.Class_Status === 1 && classDetail.Class_Completion === 0 ? (
                                                        <button className="btn btn-outline-success" onClick={() => joinClass(classDetail)}>Join Class</button>
                                                    ) : classDetail.Class_Completion === 1 ? (
                                                        <span className="text-primary">Class Completed</span>
                                                    ) : (
                                                        <span className="text-primary">Class not started</span>
                                                    )}

                                                </td>) : userRole === "teacher" ? (
                                                    <td >
                                                        {isClassLive(classDetail) ? (
                                                            <>
                                                                {classDetail.Class_Status === 1 && classDetail.Class_Completion === 0 ? (
                                                                    <button className="btn btn-outline-danger" onClick={() => endClass(classDetail)} > End Class</button>
                                                                ) :(classDetail.Class_Status === 0 && classDetail.Class_Completion === 1 )? (
                                                                    <span className="text-danger">Class Cancelled</span>
                                                                ):(
                                                                    <button className="btn btn-outline-success" onClick={() => startClass(classDetail)}>Start Class</button>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">Class not started</span>
                                                        )}
                                                    </td>) : (<td>
                                                        {classDetail.Class_Status === 1 && classDetail.Class_Completion === 0 ? (
                                                            <button className="btn btn-outline-success" >Class Ongoing</button>


                                                        ) : (
                                                            <button className="btn btn-outline-success" >No Class Yet</button>
                                                        )}
                                                    </td>)}
                                                    {userRole==="teacher" && classDetail.Class_Code!=null &&(
                                            <td className="align-middle" >{classDetail.Class_Code}</td>

                                            )}


                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                    {userRole === 'admin' || userRole === 'teacher' && (
                        <button className="btn btn-success" onClick={() => setIsPopupOpen(true)}>
                            Add Class
                        </button>
                    )}


                </div>

                <div className="card container p-0 mt-5 table-responsive">
                    <div
                        className="d-flex justify-content-between align-items-center p-3 cursor-pointer"
                        onClick={() => setShowCompletedClasses(!showCompletedClasses)}
                        style={{ cursor: 'pointer' }}
                    >
                        <h5 className="m-0">Completed Classes</h5>
                        <i className={`fas fa-chevron-${showCompletedClasses ? 'up' : 'down'}`}></i>
                    </div>
                    {showCompletedClasses && (
                        <div >
                            <table className="table table-hover text-center " >
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">

                                    <tr>
                                        <th scope="col" >Class Id </th>
                                        <th scope="col" >Module Name </th>
                                        <th scope="col" >Class Start Time </th>
                                        <th scope="col" >Class End Time </th>
                                        <th scope="col" >Class Type </th>
                                        <th scope="col" >Class Day </th>
                                        {userRole === "student" ? (
                                            <th scope="col">Teacher Name</th>
                                        ) : (<th scope="col">Section Name</th>)}
                                        <th scope="col" >
                                            <span className="sr-only"> Class </span>
                                        </th>
                                    </tr>

                                </thead>
                                <tbody>
                                    {
                                        completedClass.map((classDetail, i) => {
                                            return (

                                                <tr scope="row" key={i}>
                                                    <td className="align-middle" >{classDetail.Class_Id}</td>
                                                    <td className="align-middle">{classDetail.Module_Name}</td>
                                                    <td className="align-middle">{classDetail.Class_Start_Time}</td>
                                                    <td className="align-middle">{classDetail.Class_End_Time}</td>
                                                    <td className="align-middle">{classDetail.Class_Type}</td>
                                                    <td className="align-middle">{classDetail.Class_Day}</td>

                                                    {userRole === "student" ? (
                                                        <td className="align-middle" >{classDetail.Teacher_Name}</td>
                                                    ) : (<td className="align-middle">{classDetail.Section_Id}</td>)}

                                                    {userRole === "student" ? (
                                                        <td >
                                                            {classDetail.Class_Status === 1 && classDetail.Class_Completion === 0 ? (
                                                                <button className="btn btn-outline-success" onClick={() => joinClass(classDetail)}>Join Class</button>
                                                            ) : classDetail.Class_Completion === 1 ? (
                                                                <span className="text-primary">Class Completed</span>
                                                            ) : (
                                                                <span className="text-danger">Class Cancelled</span>
                                                            )}

                                                        </td>) : userRole === "teacher" ? (<td >
                                                            <>
                                                                {classDetail.Class_Status === 1 && classDetail.Class_Completion === 0 ? (
                                                                    <button className="btn btn-outline-danger" onClick={() => endClass(classDetail)} > End Class</button>
                                                                ) :(classDetail.Class_Status === 0 && classDetail.Class_Completion === 1 )? (
                                                                    <span className="text-danger">Class Cancelled</span>
                                                                ):(
                                                                    <button className="btn btn-outline-success" onClick={() => navigate("/ViewClassAttendance", { state: { Id: classDetail.Class_Id, From: "class", fromNavigate:true } })}>View Attendance</button>
                                                                )}
                                                            </>

                                                        </td>) : (<td>
                                                            {classDetail.Class_Status === 1 ? (
                                                                <button className="btn btn-outline-success" onClick={() => navigate("/ViewClassAttendance", { state: { Id: classDetail.Class_Id, From: "class",fromNavigate:true } })}>View Attendance</button>

                                                            ) : (
                                                                <span className="text-danger">Class Cancelled</span>
                                                            )}
                                                        </td>)}

                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Popup open={isPopupOpen} closeOnDocumentClick onClose={() => setIsPopupOpen(false)}>
                <div className='card'>
                    <form onSubmit={addNewClass}>

                        <div className="modal-content p-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                            <div className="modal-header mb-3">
                                <h3 className="modal-title">Add New Class</h3>
                            </div>


                            <div className="modal-body">
                                <div className="form-group mb-3">
                                    <label className="form-label">Class Start Time:</label>
                                    <input
                                        type="time"
                                        className="form-control"
                                        name="Class_Start_Time" required
                                        onChange={handleChanges}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label">Class End Time:</label>
                                    <input
                                        type="time"
                                        className="form-control" required
                                        name="Class_End_Time"
                                        onChange={handleChanges}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label">Class Date:</label>
                                    <input
                                        type="date" required
                                        className="form-control"
                                        name="Class_Date"
                                        onChange={handleChanges}
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label">Class Type:</label>
                                    <select name="Class_Type" onChange={handleChanges} required
                                        className="form-select">
                                        <option value="">-- Select a Class Type --</option>
                                        <option value="Lecture">Lecture</option>
                                        <option value="Tutorial">Tutorial</option>
                                        <option value="Lab">Lab</option>

                                    </select>
                                </div>

                                <div className="form-group mb-3">
                                    <label className="form-label">Section:</label>
                                    <select name="Section_Id" onChange={handleChanges} required
                                        className="form-select">
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
                                        <div className="form-group mb-3">
                                            <label className="form-label">Module:</label>
                                            <select required
                                                className="form-select"
                                                name="Module_Id"
                                                onChange={handleChanges}>
                                                <option value="">-- Select a Module --</option>
                                                {modules.map((module) => (
                                                    <option key={module.Module_id} value={module.Module_id}>
                                                        {module.Module_id}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group mb-3">
                                            <label className="form-label">Teacher:</label>
                                            <select required
                                                className="form-select"
                                                name="Teacher_Id"
                                                onChange={handleChanges}>
                                                <option value="">-- Select a Teacher --</option>
                                                {teachers.map((teacher) => (
                                                    <option key={teacher.Teacher_id} value={teacher.Teacher_id} >
                                                        {teacher.Teacher_Name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}


                                <div className="mt-4">
                                    <button className="btn btn-primary">
                                        Add Class
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

            </Popup>
        </div>

    )
}

export default Classes