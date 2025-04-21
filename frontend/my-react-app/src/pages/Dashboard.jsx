import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import SidebarComponent from '../components/SideBar'
import attendanceImage from "../assets/attendance.jpg";

import { Line, Bar } from 'react-chartjs-2'
// import { SidebarProvider,useSidebar } from '../Context/SideBarContext';
import axios from 'axios'
import toast from 'react-hot-toast'
import '../assets/SideBar-light.css'
import ComponentCard from '../components/ComponentCard'

import Badge from '../Ui/Badge';

import '../assets/Dashboard.css'
import 'chart.js/auto'
import Header from '../components/Header';


const Dashboard = ({ isLoggedIn, userRole, userId, userName }) => {

  const [attendanceData, setAttendanceData] = useState([])
  const [attendanceBySubject, setAttendanceBySubject] = useState([])

  const [dashboardData, setDashboardData] = useState([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  // const userName="Shreyash"
  const [hasFiltered, setHasFiltered] = useState(false)
  const [dateFilters, setDateFilters] = useState({ fromDate: '', toDate: '' })
  // const { isExpanded, isHovered, isMobileOpen } = useSidebar();


  useEffect(() => {
    getAttendanceByDate()
    getDashboardDetails()
    getAbsenceBySubject()
  }, [userId, userRole]);

  useEffect(() => {
    if (hasFiltered) {
      getAttendanceByDate();
    }
  }, [dateFilters])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true
  }
  const getAbsenceBySubject = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/attendance/getAttendanceBySubject?Id=${userId}&userRole=${userRole}`);
      setAttendanceBySubject(Array.isArray(response.data) ? response.data : [])

    } catch (error) {
      console.error('Error while getting the student absence by month', error)
    }
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
  const getAttendanceByDate = async () => {
    try {
      let url = `http://localhost:3000/attendance/getAttendnaceByDate?Id=${userId}&userRole=${userRole}`;

      if (dateFilters.fromDate) url += `&fromDate=${dateFilters.fromDate}`
      if (dateFilters.toDate) url += `&toDate=${dateFilters.toDate}`

      const response = await axios.get(url);
      setAttendanceData(Array.isArray(response.data) ? response.data : [])

    } catch (error) {
      console.error('Error while getting the student attendance by date', error)
      toast.error("Failed to fetch attendance data")
    }
  }

  const handleDateFilter = (e) => {
    e.preventDefault()
    setDateFilters({ fromDate, toDate })
    setHasFiltered(true)
  };


  const getDashboardDetails = async () => {
    try {
      console.log(userId, String(userRole), userName)
      const response = await axios.get(`http://localhost:3000/crud/getDashboardDetails?userId=${userId}&userRole=${userRole}`);
      console.log(response.data.data)

      setDashboardData(response.data.data)

    } catch (error) {
      console.error('Error while getting the student attendance by date', error);
      toast.error("Failed to fetch dashboard data");
    }
  }
  const BoxIcon = ({ iconName, className = "" }) => (
    <i className={`bx ${iconName} ${className} text-3xl text-gray-500`}></i>
  );

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
    <div className="">
      <div className="flex flex-col gap-4">
        <form className="flex flex-wrap gap-4" onSubmit={handleDateFilter}>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">From:</label>
            <input
              type="date"
              className=" appearance-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 "
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">To:</label>
            <input
              type="date"
              className=" appearance-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <i className="bx bx-filter-alt text-lg"></i>
            </button>
          </div>
        </form>
        <h4 className="text-xl font-semibold text-gray-800">{title}</h4>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
        {children}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen xl:flex">
      <SidebarComponent userRole={userRole} />
      <div className='home-section'>
        <Header userName={userName} userRole={userRole} />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">

          <div
            className={`flex-1 transition-all duration-300 ease-in-out `}
          >

            <div className="grid grid-cols-12 gap-4 md:gap-6">
              <div className="col-span-12 space-y-6 xl:col-span-7">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                      {/* <GroupIcon className="text-gray-800 size-6 dark:text-white/90" /> */}
                      {userRole === "student" ? (<BoxIcon iconName="bxs-chalkboard" />) : (<BoxIcon iconName="bx-group" />)}


                    </div>

                    <div className="flex items-end justify-between mt-5">
                      <div>
                        {userRole === 'student' ? (<>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Upcoming Class
                          </span>
                          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {dashboardData.upComingClass}
                          </h4>

                        </>
                        ) : (<>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total Students
                          </span>
                          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {dashboardData.totalStudents}
                          </h4>
                        </>)}
                      </div>
                      <Badge color="success">
                        GCA Dashboard
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                      {/* <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" /> */}
                      {userRole === "teacher" ? (<BoxIcon iconName="bxs-chalkboard" />) : (<BoxIcon iconName="bx-group" />)}


                    </div>
                    <div className="flex items-end justify-between mt-5">
                      <div>
                        {userRole === 'teacher' ? (<>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Completed Classes
                          </span>
                          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {dashboardData.completedClass}
                          </h4>

                        </>
                        ) : (<>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total Teachers
                          </span>
                          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {dashboardData.totalTeachers}
                          </h4>
                        </>)}
                      </div>

                      <Badge color="error">
                        GCA Dashboard
                      </Badge>
                    </div>
                  </div>


                  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                      <BoxIcon iconName="bxs-book" />


                    </div>
                    <div className="flex items-end justify-between mt-5">
                      <div>
                        {userRole === 'teacher' ? (<>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Upcoming Class
                          </span>
                          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {dashboardData.upComingClass}
                          </h4>

                        </>
                        ) : (<>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total Modules
                          </span>
                          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {dashboardData.totalModules}
                          </h4>
                        </>)}
                      </div>

                      <Badge color="error">

                        GCA Dashboard
                      </Badge>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                      <BoxIcon iconName="bx-grid-alt" />
                    </div>
                    <div className="flex items-end justify-between mt-5">
                      <div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Courses
                        </span>
                        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                          {dashboardData.totalCourses}
                        </h4>
                      </div>
                      <Badge color="success">

                        GCA Dashboard
                      </Badge>

                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-12 xl:col-span-5">
                <ComponentCard title="Subject Wise Attendance" >
                  <div className="card-body">
                    <div id="sales-chart-legend" className="chartjs-legend mt-4 mb-2">
                      <div className="relative h-60">
                        <Bar data={subjectBarChartConfig(attendanceBySubject)} options={chartOptions} />
                      </div>
                    </div>
                  </div>
                </ComponentCard>
              </div>
            </div>



            <div className="col-span-12 mt-10">
              <ComponentCard title="Overall Attendance Present Data" >
                <div className="card-body">

                  <div id="sales-chart-legend" className="chartjs-legend mt-4 mb-2">

                    <ChartCard>

                      <div style={{ position: 'relative' }}>
                        {attendanceData.length > 0 ? (
                          <Line data={lineChartConfig(attendanceData)} options={chartOptions} />
                        ) : (
                          <div className="text-center p-4">No attendance data available for the selected date range</div>
                        )}
                      </div>
                    </ChartCard>
                  </div>
                </div>
              </ComponentCard>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  )
}

export default Dashboard