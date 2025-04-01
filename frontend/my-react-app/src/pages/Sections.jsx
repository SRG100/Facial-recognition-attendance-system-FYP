import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import SidebarComponent from '../components/SideBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'reactjs-popup/dist/index.css';
import '../assets/MyPopup.css';

const Sections = ({ userRole, userId }) => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [years, setYears] = useState([]);
  const [course, setCourse] = useState([]);
  const [modules, setModuleTeachers] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newSection, setNewSection] = useState({ name: '', Year: '', Course: '' });
  const [gotTeacher, setGotTeachers] = useState(false)
  const [selectedTeachers, setSelectedTeachers] = useState({});


  const handleTeacherChange = (moduleId, teacherId) => {
    setSelectedTeachers((prev) => ({
      ...prev,
      [moduleId]: teacherId
    }));
  };

  useEffect(() => {
    if (userId) {
      getSectionDetails();
      getAcademicYear()
      getCourse()
    }
  }, [userId]);

  const getAcademicYear = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/crud/getAcademicYears`);
      setYears(Array.isArray(response.data) ? response.data : [])
      console.log(years)
    } catch (err) {
      console.error('Error while getting the student', err);
    }
  }

  const getCourse = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/courses/getCourseDetails`);
      setCourse(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error while getting the student', err);
    }
  }

  const getModulesTeachers = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/modules/getSpecificModules?Course=${newSection.Course}&Year=${newSection.Year}`)
      setModuleTeachers(response.data)
      setGotTeachers(true)
    } catch (err) {
      console.error('Error while getting the modules and teachers', err);
    }
  }

  const getSectionDetails = async () => {
    try {
      const response = await axios.get('http://localhost:3000/sections/getSection');
      setSections(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error while getting the sections', error);
    }
  };
  const cancelButton = () => {
    try {
      setIsPopupOpen(false)
      setGotTeachers(false)


    } catch (error) {
      console.error('Error while getting the sections', error);
    }
  };

  const handleAddSection = async () => {
    try {
      const newSectionDetails = {
        ...newSection,
        modules: Object.entries(selectedTeachers).map(([moduleId, teacherId]) => ({
          moduleId,
          teacherId
        }))
      }
      console.log(newSectionDetails)
      await axios.post('http://localhost:3000/sections/addSection', newSectionDetails);
      setIsPopupOpen(false)
      getSectionDetails()
      setSelectedTeachers({})
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  return (
    <div>
      <h2>Sections</h2>
      <SidebarComponent userRole={userRole} />
      <div className='home-section'>
        <table>
          <tbody>
            {sections.map((section, i) => (
              <tr key={section.Section_id || i}>
                <td className="align-middle">{section.Section_id}</td>
                {userRole === 'teacher' && (
                  <td className="align-middle">
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate('/viewStudents', { state: { Section_id: section.Section_id } })}
                    >
                      View Students
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {userRole === 'admin' && (
          <button className="btn btn-outline-warning" onClick={() => setIsPopupOpen(true)}>
            Add Section
          </button>
        )}

        <Popup open={isPopupOpen} closeOnDocumentClick onClose={() => setIsPopupOpen(false)}>
          <div className="modal-content p-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header mb-3">
              <h3 className="modal-title">Add New Section</h3>
            </div>

            <div className="modal-body">
              <div className="form-group mb-3">
                <label className="form-label">Section Name:</label>
                <input
                  type="text"
                  className="form-control"
                  value={newSection.name}
                  onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Year:</label>
                <select
                  className="form-select"
                  onChange={(e) => setNewSection({ ...newSection, Year: e.target.value })}>
                  <option value="">-- Select a Section --</option>
                  {years.map((year) => (
                    <option key={year.Academic_Year_id} value={year.Academic_Year_id}>
                      {year.Academic_Year_id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Course:</label>
                <select
                  className="form-select"
                  onChange={(e) => setNewSection({ ...newSection, Course: e.target.value })}>
                  <option value="">-- Select a Section --</option>
                  {course.map((course) => (
                    <option key={course.Course_id} value={course.Course_id}>
                      {course.Course_Name}
                    </option>
                  ))}
                </select>
              </div>

              {gotTeacher ? (
                <>
                  <div className="mt-4 mb-3">
                    <p className="text-muted">Here is the selection of a teacher for specific given modules:</p>
                    <div className="p-3 border rounded">
                      {Object.keys(modules).map((moduleId) => {
                        const module = modules[moduleId];
                        return (
                          <div key={moduleId} className="mb-3">
                            <p className="fw-semibold">{module.Module_id}:</p>
                            <select
                              className="form-select"
                              value={selectedTeachers[moduleId] || ""}
                              onChange={(e) => handleTeacherChange(moduleId, e.target.value)}>
                              <option value="">Select a Teacher</option>
                              {module.Teacher_id.map((teacherId, index) => (
                                <option key={teacherId} value={teacherId}>
                                  {module.teacher_name[index]}
                                </option>
                              ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="modal-footer mt-4">
                    <button className="btn btn-primary me-2" onClick={handleAddSection}>
                      Save Section
                    </button>
                    <button className="btn btn-secondary" onClick={cancelButton}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-4">
                  <button className="btn btn-primary" onClick={getModulesTeachers}>
                    Assigns teachers
                  </button>
                </div>
              )}
            </div>
          </div>
        </Popup>
      </div>
    </div>
  );
};

export default Sections;
