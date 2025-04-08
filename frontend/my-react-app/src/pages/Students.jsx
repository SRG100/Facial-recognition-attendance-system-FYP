import React from 'react'
import { useState, useEffect } from 'react'
import SidebarComponent from '../components/SideBar'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const Students = ({ userRole, userId }) => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [section, setSection] = useState(null)
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStudents, setFilteredStudents] = useState([]);

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

        <div className="d-flex pb-3 pt-0 mt-0" style={{ transition: "all 0.3s ease" }}>
          <div className="d-flex justify-content-between align-items-center w-100 mb-3">
            <h3 className="m-0">Students</h3>
            <div className="input-group w-50 ms-auto">
              <input
                type="text"
                className="form-control"
                placeholder="Search by ID, name, module, course, or section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="card  container p-0 m-0 table-responsive ">


          <table className="table table-hover text-center " >
            <thead className="">

              <tr>
                <th scope="col" >Student id</th>
                <th scope="col" >Student name </th>
                <th scope="col" >Module id </th>
                <th scope="col" >Courses</th>
                <th scope="col" >Sections </th>
                <th scope="col" >Review </th>
                <th scope="col" >Attendance </th>
              </tr>
            </thead>

            <tbody>
              {
                filteredStudents.map((student, i) => {
                  return (
                    <tr scope="row" style={{ transition: "all 0.3s ease" }}
                      key={i}>

                      <td className="align-middle" >{student.Student_Id}</td>
                      <td className="align-middle">{student.Student_Name}</td>
                      <td className="align-middle">{student.Modules}</td>
                      <td className="align-middle">{student.Courses}</td>
                      <td className="align-middle">{student.section_id}</td>
                      {userRole == "admin" ? (
                        <>
                          <td className="align-middle">
                            <button className="btn btn-outline-warning" onClick={() => navigate("/ViewReview", { state: { Id: student.Student_Id, ReviewOf: "Student" } })}>View Reviews</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="align-middle">
                            <button className="btn btn-outline-warning" onClick={() => navigate("/ReviewForm", { state: { Id: student.Student_Id, ReviewOf: "Student" } })}>Review Student</button>
                          </td>
                        </>
                      )}
                      <td className="align-middle">
                        <button className="btn btn-outline-primary" onClick={() => navigate("/ViewAttendance", { state: { Id: student.Student_Id, From: "student" } })}>View Attendance</button>
                      </td>

                    </tr>
                  )
                })}
            </tbody>
          </table>
          {userRole == "admin" && (
            // console.log("User Role:", userRole)
            <button className="btn btn-success" onClick={() => navigate("/Register")}>Add Students</button>
          )}
        </div>

      </div>
    </div>
  )
}

export default Students
