import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import SidebarComponent from '../components/SideBar'
import attendanceImage from "../assets/attendance.jpg";
import { Line } from 'react-chartjs-2';
import axios from 'axios'

import '../assets/Dashboard.css'
import 'chart.js/auto';


const Dashboard = ({ isLoggedIn, userRole, userId, userName }) => {

  const [attendanceData, setAttendanceData] = useState([])

  useEffect(() => {
    getAttendanceByDate()

  }, []);
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true
  }
  const getAttendanceByDate = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/attendance/getAttendnaceByDate?Id=${userId}&userRole=${userRole}&`);

      setAttendanceData(Array.isArray(response.data) ? response.data : [])

    } catch (error) {
      console.error('Error while getting the student attendnace by date', error);
    }
  }

  const lineChartConfig = (attendanceData) => {
    const labels = []
    const data = []
    // Process attendance data
    attendanceData.forEach(entry => {
      labels.push(entry.Attendance_Date);
      data.push(entry.Count);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Present',
          data: data,
          borderColor: '#3f51b5',
          backgroundColor: 'rgba(63, 81, 181, 0.2)',
          fill: true,
          tension: 0.1
        }
      ]
    };
  }
  const ChartCard = ({ title, children }) => (
    <div className="card dashboard mt-4">
      <div className="card-body">
        <h4 className="card-title">{title}</h4>
        <div className="chart-container">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* <Nav /> */}
      <SidebarComponent userRole={userRole} />
      <div className='home-section'>
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-md-12 grid-margin">
                <div className="row">
                  <div className="col-12 col-xl-8 mb-4 text-start">
                    <h3 className="font-weight-bold">Welcome {userName}</h3>
                  </div>
                  <div className="col-12 col-xl-4">
                    <div className="justify-content-end d-flex">
                      <div className="dropdown flex-md-grow-1 flex-xl-grow-0">
                        <button className="btn btn-sm btn-light bg-white" type="button" >
                          <i class='bx bxs-calendar'></i> {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).replace(' ', ' - ')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 grid-margin stretch-card">
                <div className="card dashboard tale-bg">
                  <div className="card-people mt-auto">
                    <img src={attendanceImage} alt="people" />
                    <div className="weather-info">
                      <div className="d-flex">

                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6 grid-margin transparent">
                <div className="row">
                  <div className="col-md-6 mb-4 stretch-card transparent">
                    <div className="card dashboard card-tale" style={{ background: "#7da0fa", color: "white" }}>
                      <div className="card-body">
                        <p className="mb-4">Total Students</p>
                        <p className="fs-30 mb-2">4006</p>
                        <p>10.00% (30 days)</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4 stretch-card transparent">
                    <div className="card dashboard card-dark-blue " style={{ background: "#4746a0", color: "white" }}>
                      <div className="card-body">
                        <p className="mb-4">Total Teachers</p>
                        <p className="fs-30 mb-2">61344</p>
                        <p>22.00% (30 days)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-4 mb-lg-0 stretch-card transparent">
                    <div className="card dashboard card-light-blue" style={{ background: "#7979e8", color: "white" }}>
                      <div className="card-body">
                        <p className="mb-4">Total Modules</p>
                        <p className="fs-30 mb-2 font-weight-bold">34040</p>
                        <p>2.00% (30 days)</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 stretch-card transparent">
                    <div className="card dashboard card-light-danger" style={{ background: "#f47c7c", color: "white" }}>
                      <div className="card-body">
                        <p className="mb-4">Total Courses</p>
                        <p className="fs-30 mb-2 font-weight-bold">47033</p>
                        <p>0.22% (30 days)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-12 grid-margin stretch-card">
                <div className="card dashboard">
                  <div className="card-body">
                    
                    <div id="sales-chart-legend" className="chartjs-legend mt-4 mb-2">

                      <ChartCard title="Overall Attendnace Present Data">

                        <div style={{ position: 'relative' }}>
                          <Line data={lineChartConfig(attendanceData)} options={chartOptions} />
                        </div>
                      </ChartCard>
                    </div>
                    <div className="bg-gray-200 p-4 text-center">Sales Chart Placeholder</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard