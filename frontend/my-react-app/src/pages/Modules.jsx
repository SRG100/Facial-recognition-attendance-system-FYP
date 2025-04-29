import { useState, useEffect } from 'react'
import React from 'react'
import axios from 'axios'
import SidebarComponent from '../components/SideBar'
import { Link, useNavigate } from 'react-router-dom'
import Popup from 'reactjs-popup'
import toast from 'react-hot-toast'
import PageNotFound from '../components/PageNotFound'
import Header from '../components/Header'
import ComponentCard from '../components/ComponentCard'
import Breadcrumb from '../components/Breadcrumb'

const Modules = ({ userId, userRole, userName }) => {
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
    setIsPopupOpen(false)
    getModuleDetails()

    try {
      const response = await axios.post(`http://localhost:3000/modules/addModules`, moduleValues)
      console.log(response.message)
      if (response.data.success) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error("Error while adding the module:", error);
      toast.error("An error occurred while adding the module. Please try again later.");
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
        <Header userName={userName} userRole={userRole} />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Breadcrumb pageTitle="Modules" />
          <div className="space-y-6">
            <ComponentCard title="Modules" className="mt-6">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <table className="min-w-full divide-y">
                    <thead >
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" >Module id</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Module name </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" >Module Details </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" >Module Credits  </th>

                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" >Review </th>
                        {userRole === "student" && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" >Predict Result </th>
                        )}

                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                      {
                        modules.map((module, i) => {
                          return (
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                              key={i}>

                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white" >{module.Module_id}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{module.Module_Name}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{module.Module_details}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{module.Module_Credits}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                {userRole == "student" ? (
                                  <>
                                    <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-green-100 hover:bg-blue-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                                      onClick={() => navigate("/ReviewForm", { state: { Id: module.Module_id, userRole, ReviewOf: "Module", fromNavigate: true } })}>Review Module</button>
                                  </>
                                ) : (
                                  <>
                                    <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-green-100 hover:bg-blue-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                                      onClick={() => navigate("/ViewReview", { state: { Id: module.Module_id, ReviewOf: "Module", fromNavigate: true } })}>View Reviews</button>
                                  </>
                                )}
                              </td>

                              {userRole == "student" && (
                                <>
                                  <td className="align-middle">
                                    <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                                      onClick={() => handlePredictResult(module.Module_id)}  >Predict Result</button>
                                  </td>
                                </>
                              )}

                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
              {userRole == "admin" && (
                // console.log("User Role:", userRole)
                <button className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                  onClick={() => setIsPopupOpen(true)}>Add Module</button>
              )}
            </ComponentCard>
          </div>
        </div>
      </div>
      <Popup open={isPopupOpen} closeOnDocumentClick onClose={() => setIsPopupOpen(false)}>
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto">
          <form onSubmit={addNewModule}>
            <div className="max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Add New Module</h3>
                  <button
                    type="button"
                    onClick={() => setIsPopupOpen(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4">
                {/* Module ID */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module ID</label>
                  <input
                    required
                    type="text"
                    name="moduleId"
                    onChange={handleChanges}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter module ID"
                  />
                </div>

                {/* Module Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
                  <input
                    required
                    type="text"
                    name="moduleName"
                    onChange={handleChanges}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter module name"
                  />
                </div>

                {/* Module Details */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Details</label>
                  <textarea
                    required
                    name="moduleDetails"
                    onChange={handleChanges}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter module details"
                    rows="3"
                  ></textarea>
                </div>

                {/* Module Credit */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Credit</label>
                  <select
                    name="moduleCredit"
                    onChange={handleChanges}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Select a Module Credit --</option>
                    <option value="30">30 Credits</option>
                    <option value="15">15 Credits</option>
                  </select>
                </div>

                {/* Academic Year */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <select
                    name="year"
                    onChange={handleChanges}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Select a Year --</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                  </select>
                </div>

                {/* Courses */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Courses</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-3 border border-gray-300 rounded-md bg-gray-50">
                    {course.map((courseItem) => (
                      <div key={courseItem.Course_id} className="flex items-center">
                        <input
                          id={`course-${courseItem.Course_id}`}
                          name="courses"
                          type="checkbox"
                          value={courseItem.Course_id}
                          checked={moduleValues.courses.includes(courseItem.Course_id)}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`course-${courseItem.Course_id}`} className="ml-2 block text-sm text-gray-700">
                          {courseItem.Course_Name}
                        </label>
                      </div>
                    ))}
                    {course.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No courses available</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50 flex justify-end rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setIsPopupOpen(false)}
                  className="px-4 py-2 mr-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Module
                </button>
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
        {/* Grade Prediction Popup */}
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-all">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800 text-center">Grade Prediction Results</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 text-sm text-center">
                This is a simple prediction system based on your attendance. Your actual academic qualification may be higher than predicted.
              </p>

              {isLoadingPrediction ? (
                <div className="flex flex-col items-center py-6 space-y-3">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-gray-700 font-medium">Predicting grade...</p>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-gray-700 mb-2">
                    Predicted Grade for this module based on your attendance rate:
                  </p>
                  <div className="text-3xl font-bold text-blue-700">
                    {predictedGrade || "N/A"}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsPopupOpenPredict(false)}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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