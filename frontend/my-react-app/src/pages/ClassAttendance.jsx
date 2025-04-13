import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import SidebarComponent from '../components/SideBar';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import 'boxicons/css/boxicons.min.css';
import toast from 'react-hot-toast'
import PageNotFound from '../components/PageNotFound';
import Header from '../components/Header';

const ClassAttendance = ({ userId, userRole, userName }) => {
  const location = useLocation()
  const classId = location.state?.Id || ''
  const className = location.state?.className || 'Class'
  const fromNavigate = location.state?.fromNavigate
  if (!fromNavigate) {
    return <PageNotFound />
  }

  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingChanges, setSavingChanges] = useState(false)
  const [changedRecords, setChangedRecords] = useState({})
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    late: 0
  })

  const [openDropdownId, setOpenDropdownId] = useState(null);

  const canEdit = ['teacher', 'admin'].includes(userRole);

  useEffect(() => {
    if (classId) {
      getClassAttendance();
    }
  }, [classId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const getClassAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/attendance/getClassAttendance?classId=${classId}`);

      if (Array.isArray(response.data)) {
        setAttendanceData(response.data);
        updateSummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching class attendance:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const updateSummary = (data) => {
    const presentCount = data.filter(item => item.Attendance_Status === 'Present').length;
    const absentCount = data.filter(item => item.Attendance_Status === 'Absent').length;
    const lateCount = data.filter(item => item.Attendance_Status === 'Late').length;

    setSummary({
      present: presentCount,
      absent: absentCount,
      late: lateCount
    });
  };

  // Toggle dropdown visibility
  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // Handle attendance status change
  const handleStatusChange = (attendanceId, studentId, newStatus) => {
    // Close the dropdown
    setOpenDropdownId(null);

    // Update local state for UI
    const updatedData = attendanceData.map(item => {
      if (item.Student_ID === studentId && item.Attendance_Id === attendanceId) {
        return { ...item, Attendance_Status: newStatus };
      }
      return item;
    });

    setAttendanceData(updatedData);
    updateSummary(updatedData);

    // Track changes for batch saving
    setChangedRecords({
      ...changedRecords,
      [attendanceId]: { attendanceId, studentId, newStatus }
    });
  };

  // Save all changes to the backend
  const saveChanges = async () => {
    if (Object.keys(changedRecords).length === 0) {
      toast.info('No changes to save');
      return;
    }

    const saveToastId = toast.loading('Saving attendance changes...');

    try {
      setSavingChanges(true);

      const changesArray = Object.values(changedRecords);
      const response = await axios.post('http://localhost:3000/attendance/updateAttendanceStatus', {
        changes: changesArray,
        classId: classId,
        updatedBy: userId
      });

      if (response.data.success) {
        toast.success('Attendance updated successfully', { id: saveToastId });
        setChangedRecords({});
        getClassAttendance(); // Refresh data to ensure consistency
      } else {
        toast.error(response.data.message || 'Failed to update attendance', { id: saveToastId });
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('An error occurred while saving changes', { id: saveToastId });
    } finally {
      setSavingChanges(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return 'badge bg-success';
      case 'Absent':
        return 'badge bg-danger';
      case 'Late':
        return 'badge bg-warning text-dark';
      default:
        return 'badge bg-secondary';
    }
  };

  // the colors for the chart
  const chartData = {
    labels: ['Present', 'Absent', 'Late'],
    datasets: [{
      data: [summary.present, summary.absent, summary.late],
      backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
      borderWidth: 0
    }]
  };
  //overall options for the chart
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = summary.present + summary.absent + summary.late;
            const percentage = Math.round((context.raw / total) * 100);
            return `${context.label}: ${context.raw} (${percentage}%)`;
          }
        }
      }
    }
  };
  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Present
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-amber-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Late
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-red-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Absent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  }

  // Check if there are unsaved changes
  const hasUnsavedChanges = Object.keys(changedRecords).length > 0

  if (userRole === "student") {
    return <PageNotFound />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarComponent userRole={userRole} />
      <div className='home-section'>
        <Header userName={userName} userRole={userRole} />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-gray-800">Class Attendance</h1>
                <p className="text-gray-500">
                  {classId} · {attendanceData[0]?.Class_Date ? formatDate(attendanceData[0]?.Class_Date) : ''}
                </p>
              </div>
              <div>
                {canEdit && hasUnsavedChanges && (
                  <button
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    onClick={saveChanges}
                    disabled={savingChanges}
                  >
                    {savingChanges ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : "Save Changes"}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Attendance Summary</h2>
                    <div className="flex justify-center mb-6">
                      <div className="relative h-64 w-64">
                        <Doughnut data={chartData} options={chartOptions} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-xl font-bold">{summary.present}</div>
                        <div className="text-green-600 font-medium">Present</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold">{summary.absent}</div>
                        <div className="text-red-600 font-medium">Absent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold">{summary.late}</div>
                        <div className="text-amber-600 font-medium">Late</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Student Attendance List</h2>

                    {loading ? (
                      <div className="flex justify-center items-center p-12">
                        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch-in Time</th>
                              {canEdit && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {attendanceData.length > 0 ? (
                              attendanceData.map((student, index) => (
                                <tr
                                  key={index}
                                  className={`${changedRecords[student.Attendance_Id] ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors duration-150`}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.Student_ID}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{student.Student_Name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <StatusBadge status={student.Attendance_Status} />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTime(student.Attendance_Time)}</td>
                                  {canEdit && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <div className="relative">
                                        <button
                                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                          onClick={() => toggleDropdown(student.Attendance_Id)}
                                        >
                                          Change Status
                                          <svg className="ml-2 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                          </svg>
                                        </button>

                                        {openDropdownId === student.Attendance_Id && (
                                          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                            <div className="py-1" role="menu" aria-orientation="vertical">
                                              <button
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center ${student.Attendance_Status === 'Present' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-green-700 hover:bg-gray-100'}`}
                                                onClick={() => handleStatusChange(student.Attendance_Id, student.Student_ID, 'Present')}
                                                disabled={student.Attendance_Status === 'Present'}
                                              >
                                                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                Present
                                              </button>
                                              <button
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center ${student.Attendance_Status === 'Late' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-amber-700 hover:bg-gray-100'}`}
                                                onClick={() => handleStatusChange(student.Attendance_Id, student.Student_ID, 'Late')}
                                                disabled={student.Attendance_Status === 'Late'}
                                              >
                                                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                                Late
                                              </button>
                                              <button
                                                className={`w-full text-left px-4 py-2 text-sm flex items-center ${student.Attendance_Status === 'Absent' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'text-red-700 hover:bg-gray-100'}`}
                                                onClick={() => handleStatusChange(student.Attendance_Id, student.Student_ID, 'Absent')}
                                                disabled={student.Attendance_Status === 'Absent'}
                                              >
                                                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                                Absent
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  )}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={canEdit ? 5 : 4} className="px-6 py-12 text-center text-sm text-gray-500">
                                  <div className="flex flex-col items-center">
                                    <svg className="h-12 w-12 text-gray-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>No attendance records found</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>


  );
};

export default ClassAttendance;