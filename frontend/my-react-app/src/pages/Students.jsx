import React from 'react'
import { useState, useEffect } from 'react'
import SidebarComponent from '../components/SideBar'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import PageNotFound from '../components/PageNotFound'
import Header from '../components/Header'
import Breadcrumb from '../components/Breadcrumb'
import ComponentCard from '../components/ComponentCard'
import { use } from 'react'

const Students = ({ userRole, userId, userName }) => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [section, setSection] = useState(null)
  const location = useLocation()
  const fromNavigate = location.state?.fromNavigate
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStudents, setFilteredStudents] = useState([])

  if (userRole === "student") {
    return <PageNotFound />
  }
  if(userRole === "teacher" && !fromNavigate) {
    return <PageNotFound />
  }

  useEffect(() => {
    const results = students.filter(student =>
      student.Student_Id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.Student_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.Modules.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.Courses.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.section_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(results)
  }, [searchTerm, students])

  const Section_id = location.state?.Section_id
  useEffect(() => {
    if (userRole === "admin") {
      setSection(null);
    } else if (Section_id) {
      console.log("Setting section:", Section_id);
      setSection(Section_id);
    }
  }, [userRole, Section_id]);

  useEffect(() => {
    console.log("Checking before fetching students. Section:", section);
    if (userId && userRole == "teacher" && section) {
      getStudentDetails();
    }
    else if (userId && userRole == "admin") {
      getStudentDetails()
    }
  }, [section]);

  const getStudentDetails = async () => {
    try {

      const response = await axios.get(`http://localhost:3000/students/getStudentDetail?userId=${userId}&userRole=${userRole}&section_id=${section}`);
      setStudents(Array.isArray(response.data) ? response.data : []);

    } catch (error) {
      console.error('Error while getting the student', error);
    }
  }
  return (
    <div>
      <SidebarComponent userRole={userRole} />

      <div className=' home-section'>
        <Header userRole={userRole} userName={userName} />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Breadcrumb pageTitle="Students" />
          <div className="space-y-6">
            <ComponentCard title="Students" className="mt-6" action={
              <input
                type="text"
                className="px-3 py-2 text-sm border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-white/[0.05] dark:text-white dark:border-gray-700 w-full sm:w-96"
                placeholder="Search by ID, name, module, course, or section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            }>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <table className="min-w-full divide-y">
                    <thead >
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" >Student id</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student name </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" >Module id </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Courses</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sections </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" >Review </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" >Attendance </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                      {
                        filteredStudents.map((student, i) => {
                          return (
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
                              key={i}>

                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white" >{student.Student_Id}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{student.Student_Name}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{student.Modules}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{student.Courses}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{student.section_id}</td>
                              {userRole == "admin" ? (
                                <>
                                  <td className="align-middle">
                                    <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                                      onClick={() => navigate("/ViewReview", { state: { Id: student.Student_Id, ReviewOf: "Student", fromNavigate: true } })}>View Reviews</button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="align-middle">
                                    <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                                      onClick={() => navigate("/ReviewForm", { state: { Id: student.Student_Id, ReviewOf: "Student", fromNavigate: true } })}>Review Student</button>
                                  </td>
                                </>
                              )}
                              <td className="align-middle">
                                <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                                  onClick={() => navigate("/ViewAttendance", { state: { Id: student.Student_Id, From: userRole, fromNavigate: true } })}>View Attendance</button>
                              </td>

                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
              {userRole == "admin" && (
                <button className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                  onClick={() => navigate("/Register")}>Add Students</button>
              )}
            </ComponentCard>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Students
