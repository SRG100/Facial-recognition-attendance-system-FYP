import { useState, useEffect } from 'react'
import React from 'react'
import axios from 'axios'
import SidebarComponent from '../components/SideBar'
import { Link, useNavigate } from 'react-router-dom'

const Modules = ({ userId, userRole }) => {
  const navigate = useNavigate();
  const [modules, serModules] = useState([])
  useEffect(() => {
    if (userId) {
      getModuleDetails();
    }
  }, [userId, userRole]);


  const getModuleDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/modules/getModulesDetails?userId=${userId}&userRole=${userRole}`);
      serModules(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error while getting the modules', error);
    }
  }
  return (
    <div>Modules
      <SidebarComponent userRole={userRole} />
      <div className="container p-0 m-0">
        <table className="table table-dark table-hover text-center table-responsive">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">

            <tr>
              <th scope="col" >Module id</th>
              <th scope="col" >Module name </th>
              <th scope="col" >Module Credits </th>
              <th scope="col" >Module Details </th>

              <th scope="col" >Review </th>


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
                          <button className="btn btn-outline-warning" onClick={() => navigate("/ReviewForm", { state: { Id: module.Module_id, userRole, ReviewOf: "Module" } })}>Review Module</button>
                        </>
                      ) : (
                        <>
                          <button className="btn btn-outline-warning" onClick={() => navigate("/ReviewForm", { state: { Id: module.Module_id } })}>View Reviews</button>
                        </>
                      )}
                    </td>

                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
      {userRole == "admin" && (
        // console.log("User Role:", userRole)
        <button className="btn btn-success" onClick={() => navigate("/RegisterModule")}>Add Module</button>
      )}
    </div>
  )
}

export default Modules