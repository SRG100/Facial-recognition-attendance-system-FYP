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
      if (userId && userRole=="teacher" && section) {
        getStudentDetails();
      }
      else if (userId && userRole=="admin") {
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
      <div>Students
        <SidebarComponent userRole={userRole} />
        <div className="container p-0 m-0">

          <table  className="table table-light table-hover text-center table-responsive">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">

              <tr>
                <th scope="col" >Student id</th>
                <th scope="col" >Student name </th>
                <th scope="col" >Module id </th>
                <th scope="col" >Courses</th>
                <th scope="col" >Sections </th>
                <th scope="col" >Review </th>
              </tr>
            </thead>

            <tbody>
              {
                students.map((student, i) => {
                  return (
                    <tr scope="row" key={i}>

                      <td className="align-middle" >{student.Student_Id}</td>
                      <td className="align-middle">{student.Student_Name}</td>
                      <td className="align-middle">{student.Modules}</td>
                      <td className="align-middle">{student.Courses}</td>
                      <td className="align-middle">{student.section_id}</td>
                      {userRole == "admin" ? (
                        <>
                          <td className="align-middle">
                          <button className="btn btn-outline-warning" onClick={() => navigate("/ViewReview", { state: { Id: student.Student_Id, ReviewOf: "Student" } })}>View Student Reviews</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="align-middle">
                            <button className="btn btn-outline-warning" onClick={() => navigate("/ReviewForm", { state: { Id: student.Student_Id, ReviewOf: "Student" } })}>Review Student</button>
                          </td>
                        </>
                      )}


                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
        {userRole == "admin" && (
          // console.log("User Role:", userRole)
          <button className="btn btn-success" onClick={() => navigate("/Register")}>Add Students</button>
        )}
      </div>
    )
  }

export default Students
