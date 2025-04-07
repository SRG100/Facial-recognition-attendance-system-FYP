import React, { useState, useEffect } from 'react';
import axios from 'axios'
import Popup from 'reactjs-popup';
import { useLocation } from 'react-router-dom';
import SidebarComponent from '../components/SideBar';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import 'boxicons/css/boxicons.min.css'


const AttendanceClass = ({ userId, userRole }) => {
  const location = useLocation()
  const Id = location.state?.Id 
  const From = location.state?.From || "class"
  const [classDetails, setClassDetails] = useState([])
  const [attendanceData, setAttendanceData] = useState([])
  const [studentData, setStudentData] = useState([])
  const [attendanceBySubject, setAttendanceBySubject] = useState([])



  useEffect(() => {
    getAttendnaceDetails()

  }, [Id, From]);

  useEffect(() => {
    getAttendanceByDate()
    getAbsenceByMonth()
    getAbsenceBySubject()

  }, [Id])

  const getAttendnaceDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/attendance/getAttendnaceDetails?Id=${Id}&From=${From}`);
      setStudentData(Array.isArray(response.data) ? response.data : []);

    } catch (error) {
      console.error('Error while getting the student overall attendnace', error);
    }
  }
  const getAttendanceByDate = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/attendance/getAttendnaceByDate?Id=${Id}&userRole=student`);
      setAttendanceData(Array.isArray(response.data) ? response.data : [])

    } catch (error) {
      console.error('Error while getting the student attendnace by date', error);
    }
  }
  const getAbsenceByMonth = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/attendance/getAbsenceMonth?Id=${Id}`);
      setAbsenceData(Array.isArray(response.data) ? response.data : [])

    } catch (error) {
      console.error('Error while getting the student absence by month', error)
    }
  }

  // Chart data configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true
  }

  const doughnutChart = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [studentData[0]?.Present_Count, studentData[0]?.Absent_Count, studentData[0]?.Late_Count],
      backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
      borderWidth: 0
    }]
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
  const monthlyAttendanceChartConfig = (absenceData) => {
    return {
      labels: absenceData.map(entry => entry.Month),
      datasets: [{
        label: 'Monthly Absences',
        data: absenceData.map(entry => entry.Absent_Count),
        backgroundColor: '#f44336',
      }]
    }
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
    <div className="attendance-dashboard">
      <SidebarComponent userRole={userRole} />

      <div className="home-section">
        <div className="content-wrapper">
          {/* Header */}
          <div className="page-header">
            <h3 className="page-title">Attendance Dashboard</h3>
          </div>

          {/* Student Info Summary */}
          <div className="student-info-card mb-4">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Student Information</h4>
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div>
                    <p className="mb-1"><strong>Student ID:</strong> {studentData[0]?.Student_ID}</p>
                    <p className="mb-1"><strong>Name:</strong> {studentData[0]?.Student_Name}</p>
                    <button className='btn btn-outline-primary mt-2'>Predict Result</button>

                  </div>
                  <div>
                    <p className="mb-1"><strong>Attendance Rate:</strong> {studentData[0]?.Attendance_Percentage}%</p>
                    <p className="mb-1"><strong>Total Classes:</strong> {studentData[0]?.Total_Classes}</p>
                    <button className='btn btn-outline-primary mt-2' onClick={() => setIsPopupOpen(true)} >Generate Report</button>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt-2">

            <div className="col-lg-6 grid-margin mx-auto">
              <ChartCard title="Attendance Summary">
                <div className="d-flex justify-content-center">
                  <div style={{ position: 'relative', height: '230px', width: '250px' }}>
                    <Doughnut data={doughnutChart} options={chartOptions} />
                  </div>
                </div>
              </ChartCard>
            </div>



            <div className="col-lg-6 grid-margin ml-1">
              <ChartCard title="Subject-wise Attendance">
                <div style={{ position: 'relative', height: '230px' }}>
                  <Bar data={subjectBarChartConfig(attendanceBySubject)} options={chartOptions} />
                </div>
              </ChartCard>
            </div>
          </div>
          <div className="row">
            
            <div className="col-lg-6 grid-margin ml-1">
              
              <ChartCard title="Overall Attendnace Present Data">
                <div style={{ position: 'relative', height: '230px' }}>
                  <Line data={lineChartConfig(attendanceData)} options={chartOptions} />
                </div>
              </ChartCard>
            </div>
            <div className="col-lg-6 grid-margin">
              <ChartCard title="Monthly Absence Report">
                <div style={{ position: 'relative', height: '230px' }}>
                  <Bar data={monthlyAttendanceChartConfig(absenceData)} options={chartOptions} />
                </div>
              </ChartCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceClass;