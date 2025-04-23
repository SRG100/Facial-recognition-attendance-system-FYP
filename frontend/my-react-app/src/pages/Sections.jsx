import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import SidebarComponent from '../components/SideBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'reactjs-popup/dist/index.css';
import '../assets/MyPopup.css';
import toast from 'react-hot-toast'
import PageNotFound from '../components/PageNotFound'
import Header from '../components/Header'
import Breadcrumb from '../components/Breadcrumb';
import ComponentCard from '../components/ComponentCard';

const Sections = ({ userRole, userId, userName }) => {
  if (userRole === "student") {
    return <PageNotFound />
  }
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
      setModuleTeachers([])
      setNewSection({ name: '', Year: '', Course: '' })
      setSelectedTeachers({})


    } catch (error) {
      console.error('Error while getting the sections', error);
    }
  }
  const getModulesTeachers = async () => {
    try {
      if (!newSection.Course || !newSection.Year || !newSection.name === null) {
        toast.error("Please fill all the fields.")
        return
      }
      const response = await axios.get(`http://localhost:3000/modules/getSpecificModules?Course=${newSection.Course}&Year=${newSection.Year}`)
      setModuleTeachers(response.data)
      setGotTeachers(true)
    } catch (err) {
      console.error('Error while getting the modules and teachers', err);
    }
  }

  const handleAddSection = async () => {
    try {
      if (selectedTeachers.teacherId === null) {
        toast.error("Select respective teachers")
        return

      }
      const newSectionDetails = {
        ...newSection,
        modules: Object.entries(selectedTeachers).map(([moduleId, teacherId]) => ({
          moduleId,
          teacherId
        }))
      }
      console.log(newSectionDetails)
      const response = await axios.post('http://localhost:3000/sections/addSection', newSectionDetails)
      if (response.data.success) {
        toast.success(response.data.message)

      } else {
        toast.error(response.data.message)

      }

      setIsPopupOpen(false)
      getSectionDetails()
      setGotTeachers(false)
      setModuleTeachers([])
      setSelectedTeachers({})
      setNewSection({ name: '', Year: '', Course: '' })
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  return (
    <div>
      <SidebarComponent userRole={userRole} />
      <div className='home-section'>
        <Header userName={userName} userRole={userRole} />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Breadcrumb pageTitle="Sections" />
          <div className="space-y-6">
            <ComponentCard title="Sections" className="mt-6">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <table className="min-w-full divide-y">
                    <thead >
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Section id</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" >Modules </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Academic Year </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" >Course</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" >Total_Students </th>
                        {userRole === 'teacher' && (
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Students
                          </th>

                        )}

                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                      {sections.map((section, i) => (
                        <tr key={section.Section_id || i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{section.Section_id}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{section.Modules}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{section.Academic_Years}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{section.Courses}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{section.Total_Students}</td>

                          {userRole === 'teacher' && (
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                                onClick={() => navigate('/viewStudents', { state: { Section_id: section.Section_id, fromNavigate: true } })} >
                                View Students
                              </button>
                            </td>

                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {userRole === 'admin' && (
                <button className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                  onClick={() => setIsPopupOpen(true)}>
                  Add Section
                </button>
              )}
            </ComponentCard>
          </div>
        </div>

        <Popup open={isPopupOpen} closeOnDocumentClick onClose={() => setIsPopupOpen(false)}>
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Add New Section</h3>
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={newSection.name}
                    onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                    placeholder="Enter section name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => setNewSection({ ...newSection, Year: e.target.value })}
                  >
                    <option value="">-- Select a Year --</option>
                    {years.map((year) => (
                      <option key={year.Academic_Year_id} value={year.Academic_Year_id}>
                        {year.Academic_Year_id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => setNewSection({ ...newSection, Course: e.target.value })}
                  >
                    <option value="">-- Select a Course --</option>
                    {course.map((course) => (
                      <option key={course.Course_id} value={course.Course_id}>
                        {course.Course_Name}
                      </option>
                    ))}
                  </select>
                </div>

                {gotTeacher ? (
                  <>
                    <div className="mt-6">
                      <p className="text-sm text-gray-600 mb-2">Here is the selection of a teacher for specific given modules:</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-4">
                        {Object.keys(modules).map((moduleId) => {
                          const module = modules[moduleId];
                          return (
                            <div key={moduleId}>
                              <p className="font-medium text-gray-800 mb-1">{module.Module_id}:</p>
                              <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedTeachers[moduleId] || ""}
                                onChange={(e) => handleTeacherChange(moduleId, e.target.value)}
                              >
                                <option value="">Select a Teacher</option>
                                {module.Teacher_id.map((teacherId, index) => (
                                  <option key={teacherId} value={teacherId}>
                                    {module.teacher_name[index]}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                      <button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
                        onClick={handleAddSection}
                      >
                        Save Section
                      </button>
                      <button
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition duration-200"
                        onClick={cancelButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-6">
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
                      onClick={getModulesTeachers}
                    >
                      Assign Teachers
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Popup>
      </div>
    </div>
  );
};

export default Sections;
