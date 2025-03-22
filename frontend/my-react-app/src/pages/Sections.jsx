import React from 'react'
import { useState, useEffect } from 'react'
import SidebarComponent from '../components/SideBar'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'


const Sections = ({ userRole, userId }) => {
  const navigate = useNavigate()

  const [sections, setSections] = useState([])

  useEffect(() => {
    if (userId) {
      getSectionDetails();
    }
  }, [userId]);


  const getSectionDetails = async () => {
    try {

      const response = await axios.get(`http://localhost:3000/sections/getSection`);
      setSections(Array.isArray(response.data) ? response.data : []);

    } catch (error) {
      console.error('Error while getting the teachers', error);
    }
  }
  return (
    <div>Sections
      <SidebarComponent userRole={userRole} />

      <table>
        <tbody>
          {sections.map((section, i) => (
            <tr scope="row" key={section.Section_id || i}>
              <td className="align-middle">{section.Section_id}</td>
              {userRole === "teacher" && (
                <td className="align-middle">
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => navigate("/viewStudents", { state: { Section_id: section.Section_id } })}
                  >
                    View Students
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {userRole == "admin" && (
        <>
          <td className="align-middle">
            <button className="btn btn-outline-warning">Add Section</button>
          </td>
        </>
      )}
    </div>
  )
}

export default Sections