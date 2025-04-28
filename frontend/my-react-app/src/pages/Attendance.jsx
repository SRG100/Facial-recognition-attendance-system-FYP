import React, { useState, useEffect } from 'react';
import axios from 'axios'
import Popup from 'reactjs-popup';
import { useLocation } from 'react-router-dom';
import SidebarComponent from '../components/SideBar';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

import 'chart.js/auto';
import 'boxicons/css/boxicons.min.css'
import toast from 'react-hot-toast'
import PageNotFound from '../components/PageNotFound';
import Header from '../components/Header';
import Breadcrumb from '../components/Breadcrumb';


const Attendance = ({ userId, userRole, userName }) => {
  const location = useLocation()
  const Id = location.state?.Id || userId
  const From = location.state?.From || "student"
  const fromNavigate = location.state?.fromNavigate
  console.log(From)
  const [studentData, setStudentData] = useState([])
  const [attendanceData, setAttendanceData] = useState([])
  const [absenceData, setAbsenceData] = useState([])
  const [attendanceBySubject, setAttendanceBySubject] = useState([])
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [reportCredit, setReportCredit] = useState({ Module: '', From: '', To: '' });


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
      const response = await axios.get(`http://localhost:3000/attendance/getAttendnaceDetails?Id=${Id}&From=${From}&userRole=${userRole}&userId=${userId}`);
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
      const response = await axios.get(`http://localhost:3000/attendance/getAbsenceMonth?Id=${Id}&userRole=${userRole}`);
      setAbsenceData(Array.isArray(response.data) ? response.data : [])

    } catch (error) {
      console.error('Error while getting the student absence by month', error)
    }
  }
  const getAbsenceBySubject = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/attendance/getAttendanceBySubject?Id=${Id}&from=student&userRole=${userRole}`);
      setAttendanceBySubject(Array.isArray(response.data) ? response.data : [])

    } catch (error) {
      console.error('Error while getting the student absence by month', error)
    }
  }
  const generateReport = async (e) => {
    e.preventDefault()
    try {
      console.log(reportCredit)
      let url = `http://localhost:3000/generate/generateReport?Module=${reportCredit.Module}&From=${reportCredit.From}&To=${reportCredit.To}&Id=${Id}`
      if (userRole === "teacher") url += `&Teacher_Id=${userId}&UserRole=${userRole}`
      const response = await axios.get(url, { responseType: 'blob' });
      const blob = response.data
      const pdfUrl = URL.createObjectURL(blob)
      toast.success(response)
      window.open(pdfUrl, "_blank")
      window.location.reload()
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
      backgroundColor: ['#98D8C8', '#F6A6A6', '#D9D9F3'],
      borderWidth: 0
    }]
  };

  const subjectBarChart = {
    labels: ['Math', 'Science', 'English', 'Social Studies', 'Computer Science'],
    datasets: [{
      label: 'Attendance %',
      data: [90, 85, 80, 70, 95],
      backgroundColor: '#2196f3',
    }]
  }
  const subjectBarChartConfig = (attendanceBySubject) => {
    const labels = [];
    const presentData = [];
    const lateData = [];
    const absentData = [];

    attendanceBySubject.forEach(entry => {
      labels.push(entry.Module_name);
      presentData.push(entry.Present_Count);
      lateData.push(entry.Late_Count);
      absentData.push(entry.Absent_Count);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Present',
          data: presentData,
          backgroundColor: '#98D8C8',
        },
        {
          label: 'Late',
          data: lateData,
          backgroundColor: '#D9D9F3',
        },
        {
          label: 'Absent',
          data: absentData,
          backgroundColor: '#F6A6A6',
        }
      ]
    };
  };


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
          borderColor: '#009688',
          backgroundColor: 'rgba(0, 150, 136, 0.2)',
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
        backgroundColor: '#F6A6A6',
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
  )
  if (!fromNavigate && userRole === "teacher") {
    return <PageNotFound />
  }
  if (!fromNavigate && userRole === "admin") {
    return <PageNotFound />
  }

  return (
    <div className="attendance-dashboard">
      <SidebarComponent userRole={userRole} />

      <div className="home-section">
        <Header userName={userName} userRole={userRole} />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Breadcrumb pageTitle="Attendance" />
          

          <div className="mb-6">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]
">
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-700 mb-4">Student Information</h4>
                <div className="flex flex-wrap justify-between items-center">
                  <div>
                    <p className="mb-2"><span className="font-semibold">Student ID:</span> {studentData[0]?.Student_ID}</p>
                    <p className="mb-2"><span className="font-semibold">Name:</span> {studentData[0]?.Student_Name}</p>
                  </div>
                  <div>
                    <p className="mb-2"><span className="font-semibold">Attendance Rate:</span> {studentData[0]?.Attendance_Percentage}%</p>
                    <p className="mb-2"><span className="font-semibold">Total Classes:</span> {studentData[0]?.Total_Classes}</p>
                    <button
                      className="mt-3 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => setIsPopupOpen(true)}
                    >
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Popup for Report Generation */}
          <Popup open={isPopupOpen} closeOnDocumentClick onClose={() => setIsPopupOpen(false)}>
            <div className="bg-white rounded-lg shadow-xl">
              <div className="p-6 max-h-screen overflow-y-auto">
                <form onSubmit={generateReport}>
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Generate Attendance Report</h3>
                  </div>

                  <div>
                    <h5 className="text-lg font-medium text-gray-700 mb-3">Select criteria</h5>
                    {(userRole === "admin" || userRole === "student") && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modules:</label>
                        <select
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={(e) => setReportCredit({ ...reportCredit, Module: e.target.value })}
                        >
                          <option value="">-- Select Module --</option>
                          <option value="All">All</option>
                          {attendanceBySubject.map((module) => (
                            <option key={module.Module_id} value={module.Module_id}>
                              {module.Module_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">From:</label>
                      <input
                        type="date"
                        required
                        value={reportCredit.From}
                        onChange={(e) => {
                          setReportCredit((prev) => ({ ...prev, From: e.target.value }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">To:</label>
                      <input
                        type="date"
                        required
                        value={reportCredit.To}
                        onChange={(e) => {
                          setReportCredit((prev) => ({ ...prev, To: e.target.value }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Generate Report
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </Popup>

          {/* Charts - First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Attendance Summary Chart */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Attendance Summary</h4>
              <div className="flex justify-center">
                <div className="relative h-60 w-64">
                  <Doughnut data={doughnutChart} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Subject-wise Attendance Chart */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Subject-wise Attendance</h4>
              <div className="relative h-60">
                <Bar data={subjectBarChartConfig(attendanceBySubject)} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Charts - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Attendance Chart */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Overall Attendance Present Data</h4>
              <div className="relative h-60">
                <Line data={lineChartConfig(attendanceData)} options={chartOptions} />
              </div>
            </div>

            {/* Monthly Absence Report Chart */}
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">Monthly Absence Report</h4>
              <div className="relative h-60">
                <Bar data={monthlyAttendanceChartConfig(absenceData)} options={chartOptions} />
              </div>
            </div>
          </div>
      </div>
      </div>
      </div>
  );
};


export default Attendance