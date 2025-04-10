import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import SidebarComponent from '../components/SideBar';
import { Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import 'boxicons/css/boxicons.min.css';
import toast from 'react-hot-toast'
import PageNotFound from '../components/PageNotFound';

const ClassAttendance = ({ userId, userRole }) => {
  const location = useLocation()
  const classId = location.state?.Id || ''
  const className = location.state?.className || 'Class'
  const fromNavigate = location.state?.fromNavigate
  if(!fromNavigate){
    return <PageNotFound/>
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
    switch(status) {
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
          label: function(context) {
            const total = summary.present + summary.absent + summary.late;
            const percentage = Math.round((context.raw / total) * 100);
            return `${context.label}: ${context.raw} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = Object.keys(changedRecords).length > 0

  if (userRole==="student") {
    return <PageNotFound />
}

  return (
    <div className="class-attendance-dashboard">
      <SidebarComponent userRole={userRole} />

      <div className="home-section">
        <div className="content-wrapper p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center text-center mb-4">
            <div>
              <h3 className="page-title">Class Attendance</h3>
              <p className="text-muted">{classId} · {attendanceData[0]?.Class_Date ? formatDate(attendanceData[0]?.Class_Date) : ''}</p>
            </div>
            <div className="d-flex gap-2">
              {canEdit && hasUnsavedChanges && (
                <button 
                  className="btn btn-primary" 
                  onClick={saveChanges}
                  disabled={savingChanges}
                >
                  {savingChanges ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : "Save Changes"}
                </button>
              )}
              
            </div>
          </div>

          <div className="row">
            {/* Attendance Chart */}
            <div className="col-lg-4">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Attendance Summary</h4>
                  <div className="chart-container d-flex justify-content-center text-center">
                    <div style={{ position: 'relative', height: '250px', width: '250px' }}>
                      <Doughnut data={chartData} options={chartOptions} />
                    </div>
                  </div>
                  <div className="attendance-stats mt-4">
                    <div className="d-flex justify-content-between">
                      <div className="text-center">
                        <h5>{summary.present}</h5>
                        <p className="text-success">Present</p>
                      </div>
                      <div className="text-center">
                        <h5>{summary.absent}</h5>
                        <p className="text-danger">Absent</p>
                      </div>
                      <div className="text-center">
                        <h5>{summary.late}</h5>
                        <p className="text-warning">Late</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="card mt-3">
                <div className="card-body">
                  <h4 className="card-title mb-4">Student Attendance List</h4>
                  
                  {loading ? (
                    <div className="text-center p-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive attendnace">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Student ID</th>
                            <th>Student Name</th>
                            <th>Status</th>
                            <th>Punch-in Time</th>
                            {canEdit && <th>Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceData.length > 0 ? (
                            attendanceData.map((student, index) => (
                              <tr key={index} className={changedRecords[student.Attendance_Id] ? 'table-info' : ''}>
                                <td>{student.Student_ID}</td>
                                <td>{student.Student_Name}</td>
                                <td>
                                  <span className={getStatusBadge(student.Attendance_Status)}>
                                    {student.Attendance_Status}
                                  </span>
                                </td>
                                <td>{formatTime(student.Attendance_Time)}</td>
                                {canEdit && (
                                  <td>
                                    {/* Custom dropdown implementation */}
                                    <div className="dropdown position-relative">
                                      <button   className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                        type="button" onClick={() => toggleDropdown(student.Attendance_Id)} >
                                        Change Status
                                      </button>
                                      {openDropdownId === student.Attendance_Id && (
                                        <ul className="dropdown-menu show position-absolute" style={{ minWidth: '200px' }}>
                                          <li>
                                            <button 
                                              className="dropdown-item text-success" 
                                              onClick={() => handleStatusChange(student.Attendance_Id, student.Student_ID, 'Present')}
                                              disabled={student.Attendance_Status === 'Present'}
                                            >
                                              <i className="bx bx-check me-2"></i>Present
                                            </button>
                                          </li>
                                          <li>
                                            <button 
                                              className="dropdown-item text-warning" 
                                              onClick={() => handleStatusChange(student.Attendance_Id, student.Student_ID, 'Late')}
                                              disabled={student.Attendance_Status === 'Late'}
                                            >
                                              <i className="bx bx-time me-2"></i>Late
                                            </button>
                                          </li>
                                          <li>
                                            <button 
                                              className="dropdown-item text-danger" 
                                              onClick={() => handleStatusChange(student.Attendance_Id, student.Student_ID, 'Absent')}
                                              disabled={student.Attendance_Status === 'Absent'}
                                            >
                                              <i className="bx bx-x me-2"></i>Absent
                                            </button>
                                          </li>
                                        </ul>
                                      )}
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={canEdit ? "5" : "4"} className="text-center">No attendance records found</td>
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
  );
};

export default ClassAttendance;