import { useState, useEffect } from 'react'
import React from 'react'
import axios from 'axios'
import SidebarComponent from '../components/SideBar'
import { Link, useNavigate } from 'react-router-dom'
import Popup from 'reactjs-popup'
import toast from 'react-hot-toast'
import PageNotFound from '../components/PageNotFound'

const Modules = ({ userId, userRole }) => {
  if (userRole === "teacher") {
    return <PageNotFound />
  }
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isPopupOpenPredict, setIsPopupOpenPredict] = useState(false)
  const [predictedGrade, setPredictedGrade] = useState("")
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(true)
  useEffect(() => {
    if (isPopupOpenPredict) {
      setIsLoadingPrediction(true)
      const timer = setTimeout(() => {
        setIsLoadingPrediction(false)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isPopupOpenPredict])



  const [course, setCourse] = useState([])
  const [moduleValues, setModuleValues] = useState({
    moduleId: '',
    moduleName: '',
    moduleDetails: '',
    moduleCredit: '',
    year: '',
    courses: []
  })
  useEffect(() => {
    if (userId) {
      getModuleDetails()
      getCourse()
    }
  }, [userId, userRole])

  const getCourse = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/courses/getCourseDetails`);
      setCourse(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.log('Error while getting the student', err)

      toast.error('Error while getting the student')
    }
  }


  const getModuleDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/modules/getModulesDetails?userId=${userId}&userRole=${userRole}`);
      setModules(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Error while getting the modules');
    }
  }
  const handleChanges = (e) => {

    const { name, value } = e.target;
    setModuleValues(prevState => ({
      ...prevState,
      [name]: value
    }));
  }

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    setModuleValues((prev) => {
      let updatedCourses = [...prev.courses];

      if (checked) {
        updatedCourses.push(value);
      } else {
        updatedCourses = updatedCourses.filter((courseId) => courseId !== value);
      }

      return {
        ...prev,
        courses: updatedCourses,
      }
    })
  }

  const addNewModule = async (e) => {
    e.preventDefault()
    if (!moduleValues.moduleId || !moduleValues.moduleName || !moduleValues.moduleDetails || !moduleValues.moduleCredit || !moduleValues.year || moduleValues.courses.length === 0) {
      toast.error("Please fill all the fields.")
      return
    }

    console.log("Well the data before sending is :", moduleValues)

    try {
      const response = await axios.post(`http://localhost:3000/modules/addModules`, moduleValues)
      console.log(response.message)
      if (response.data.success) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error("Error while getting the teachers")
    }
  }
  const handlePredictResult = async (moduleId) => {
    try {
      const response = await axios.get(`http://localhost:3000/attendance/getAttendnaceDetails?Id=${userId}&From=${userRole}&Module_id=${moduleId}`)
      const data = Array.isArray(response.data) ? response.data : []
      setIsPopupOpenPredict(true)
      if (data && data.length > 0) {
        const studentAttendance = data.find(item => item.Student_ID === userId)
        if (studentAttendance) {
          const percentage = studentAttendance.Attendance_Percentage
          let grade = "Concerning";

          if (percentage >= 80) grade = "A";
          else if (percentage >= 60) grade = "B";
          else if (percentage >= 40) grade = "C";
          else if (percentage >= 20) grade = "D";

          setPredictedGrade(grade);
        }
      }

    } catch (err) {
      console.error("Error predicting result:", err);
    }
  };

  return (
    <div>

      <SidebarComponent userRole={userRole} />
      <div className='home-section'>
        <h3 className="m-0 mb-3  text-start">Modules</h3>

        <div className="card container p-0 m-0 table-responsive">
          <table className="table table-hover text-center ">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">

              <tr>
                <th scope="col" >Module id</th>
                <th scope="col" >Module name </th>
                <th scope="col" >Module Details </th>
                <th scope="col" >Module Credits  </th>

                <th scope="col" >Review </th>
                {userRole === "student" && (
                  <th scope="col" >Predict Result </th>
                )}

              </tr>
            </thead>

            <tbody>
              {
                modules.map((module, i) => {
                  return (
                    <tr scope="row" key={i}>

                      <td className="align-middle" >{module.Module_id}</td>
                      <td className="align-middle">{module.Module_Name}</td>
                      <td className="align-middle">{module.Module_details}</td>
                      <td className="align-middle">{module.Module_Credits}</td>
                      <td className="align-middle">
                        {userRole == "student" ? (
                          <>
                            <button className="btn btn-outline-warning" onClick={() => navigate("/ReviewForm", { state: { Id: module.Module_id, userRole, ReviewOf: "Module", fromNavigate: true } })}>Review Module</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-outline-warning" onClick={() => navigate("/ViewReview", { state: { Id: module.Module_id, ReviewOf: "Module", fromNavigate: true } })}>View Reviews</button>
                          </>
                        )}
                      </td>

                      {userRole == "student" && (
                        <>
                          <td className="align-middle">
                            <button className="btn btn-outline-success" onClick={() => handlePredictResult(module.Module_id)}  >Predict Result</button>
                          </td>
                        </>
                      )}

                    </tr>
                  )
                })}
            </tbody>
          </table>
          {userRole == "admin" && (
            // console.log("User Role:", userRole)
            <button className="btn btn-success" onClick={() => setIsPopupOpen(true)}>Add Module</button>
          )}
        </div>

      </div>

      <Popup open={isPopupOpen} closeOnDocumentClick onClose={() => setIsPopupOpen(false)}>
        <div className='card'>
          <form onSubmit={addNewModule}>

            <div className="modal-content p-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="modal-header mb-3">
                <h3 className="modal-title">Add New module</h3>
              </div>
              <div className="modal-body">
                <div className="form-group mb-3">
                  <label className="form-label">Module Id:</label>
                  <input required
                    type="text"
                    className="form-control"
                    name="moduleId"
                    onChange={handleChanges}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Module Name</label>
                  <input required
                    type="text"
                    className="form-control"
                    name="moduleName"
                    onChange={handleChanges}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Module Details:</label>
                  <input required
                    type="text"
                    className="form-control"
                    name="moduleDetails"
                    onChange={handleChanges}
                  />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Module Credit:</label>
                  <select name="moduleCredit" onChange={handleChanges} required
                    className="form-select">
                    <option value="">-- Select a Module Credit --</option>
                    <option value="30">30 Credits</option>
                    <option value="15">15 Credits</option>
                  </select>
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">Academic year:</label>
                  <select name="year" onChange={handleChanges} required
                    className="form-select">
                    <option value="">-- Select a Year --</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Courses:</label>
                  <div className="form-check-group">
                    {course.map((courseItem) => (
                      <div className="form-check" key={courseItem.Course_id}>
                        <input
                          className="form-check-input" required
                          type="checkbox"
                          id={`course-${courseItem.Course_id}`}
                          value={courseItem.Course_id}
                          checked={moduleValues.courses.includes(courseItem.Course_id)}
                          onChange={handleCheckboxChange}
                        />
                        <label className="form-check-label" htmlFor={`course-${courseItem.Course_id}`}>
                          {courseItem.Course_Name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <button className="btn btn-primary">
                    Add Module
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

      </Popup>
      <Popup
        open={isPopupOpenPredict}
        closeOnDocumentClick
        onClose={() => setIsPopupOpenPredict(false)}
      >
        <div className="card border-0 shadow">
          <div className="card-header bg-primary text-white">
            <h5 className="card-title mb-0">Grade Prediction Results</h5>
          </div>

          <div className="card-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <p className="text-muted mb-3">
              This is a simple prediction system based on your attendance. Your actual academic qualification may be higher than predicted.
            </p>

            {isLoadingPrediction ? (
              <div className="d-flex flex-column align-items-center justify-content-center mt-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Predicting grade...</p>
              </div>
            ) : (
              <div className="alert alert-success mt-4">
                <h6 className="mb-2">Predicted Grade for this module based on your attendance rate:</h6>
                <div className="display-4 font-weight-bold text-success text-center">{predictedGrade || "N/A"}</div>
              </div>
            )}

            <div className="text-end mt-4">
              <button
                className="btn btn-primary"
                onClick={() => setIsPopupOpenPredict(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Popup>
    </div>
  )
}

export default Modules