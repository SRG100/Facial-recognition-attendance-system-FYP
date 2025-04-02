import React from 'react'
import { useState, useEffect } from 'react'
import SidebarComponent from '../components/SideBar'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const Examples = ({ userRole, userId }) => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [section, setSection] = useState(null)
  const location = useLocation()

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
      getStudentDetails();
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

      <div className='home-section'>
        <div className="row">
          <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
              <div className="card-body">
                <p className="card-title mb-0">Student List</p>
                <div className="table-responsive">
                  <table className="table table-striped table-borderless">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Module ID</th>
                        <th>Course</th>
                        <th>Section</th>
                        <th>Review</th>
                        <th>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, i) => (
                        <tr key={i}>
                          <td>{student.Student_Id}</td>
                          <td className="font-weight-bold">{student.Student_Name}</td>
                          <td>{student.Modules}</td>
                          <td>{student.Courses}</td>
                          <td>{student.section_id}</td>
                          <td className="font-weight-medium">
                            {userRole == "admin" ? (
                              <div className="badge badge-success">
                                <button className="btn-link text-white p-0 border-0 bg-transparent" 
                                        onClick={() => navigate("/ViewReview", { state: { Id: student.Student_Id, ReviewOf: "Student" } })}>
                                  View Reviews
                                </button>
                              </div>
                            ) : (
                              <div className="badge badge-warning">
                                <button className="btn-link text-white p-0 border-0 bg-transparent" 
                                        onClick={() => navigate("/ReviewForm", { state: { Id: student.Student_Id, ReviewOf: "Student" } })}>
                                  Review Student
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="font-weight-medium">
                            <div className="badge badge-primary">
                              <button className="btn-link text-white p-0 border-0 bg-transparent" 
                                      onClick={() => navigate("/ViewAttendance", { state: { Id: student.Student_Id, From: "student" } })}>
                                View Attendance
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {userRole == "admin" && (
          <button className="btn btn-success mt-3" onClick={() => navigate("/Register")}>Add Students</button>
        )}
      </div>
    </div>
  )
}

export default Examples