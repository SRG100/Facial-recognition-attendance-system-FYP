import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import SidebarComponent from '../components/SideBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'reactjs-popup/dist/index.css';
// import './MyPopup.css';

const Sections = ({ userRole, userId }) => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newSection, setNewSection] = useState({ name: '', Year: '' , Course:''});

  useEffect(() => {
    if (userId) {
      getSectionDetails();
    }
  }, [userId]);

  const getSectionDetails = async () => {
    try {
      const response = await axios.get('http://localhost:3000/sections/getSection');
      setSections(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error while getting the sections', error);
    }
  };

  const handleAddSection = async () => {
    try {
      await axios.post('http://localhost:3000/sections/addSection', newSection);
      setIsPopupOpen(false)
      getSectionDetails()
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  return (
    <div>
      <h2>Sections</h2>
      <SidebarComponent userRole={userRole} />

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
        <div className="popup-content">
          <h3>Add New Section</h3>
          <label>Section Name:</label>
          <input
            type="text"
            value={newSection.name}
            onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
          />
          <label>Year:</label>
          <input
            type="text"
            value={newSection.Year}
            onChange={(e) => setNewSection({ ...newSection, Year: e.target.value })}
          />
          <label>Course:</label>
          <input
            type="text"
            value={newSection.Course}
            onChange={(e) => setNewSection({ ...newSection, Course: e.target.value })}
          />
          <button className="btn btn-primary" onClick={handleAddSection}>
            Save Section
          </button>
          <button className="btn btn-secondary" onClick={() => setIsPopupOpen(false)}>
            Cancel
          </button>
        </div>
      </Popup>
    </div>
  );
};

export default Sections;
