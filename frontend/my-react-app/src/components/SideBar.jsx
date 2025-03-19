import React , { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios'
import "../assets/SideBar.css"
{ useState, useEffect }

const SidebarComponent = ({userRole}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        // Check if the token exists in cookies and verify the authorization
        const checkAuthorization = async () => {
            try {
                const response = await axios.get('http://localhost:3000/auth/isAuthorized', { withCredentials: true });
                const isVerified = response.data?.success;
                const role = response.data?.role;  // You can use this if needed for role-based logic

                console.log('Authorization response:', response.data);

                if (isVerified) {
                    setIsLoggedIn(true);  // User is logged in
                } else {
                    setIsLoggedIn(false); // User is not logged in
                }
            } catch (error) {
                console.error('Error checking authorization:', error);
                setIsLoggedIn(false); // Default to false if error occurs
            }
        };

        checkAuthorization();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await axios.get('http://localhost:3000/auth/logout', { withCredentials: true })
            const logoutSuccess = response.data.success
            console.log(logoutSuccess)
            if (logoutSuccess) {
                alert(response.data.message);
            } else {
                console.error("Logout failed:", response.data.message);
            }
            window.location.reload();

        }
        catch (err) {
            console.log("error while logging out", err)
        }


    };
    if(userRole === "admin") {
        return (

            <div>
                
                <div className="sidebar">
                    <div className="logo-details">
                        <i className='bx bxl-c-plus-plus icon'></i>
                        <i className='bx bx-menu' id="btn"></i>
                    </div>
                    <ul className="nav-list">
                        <li>
                            <NavLink to="/">
                                <i className='bx bx-grid-alt'></i>
                            </NavLink>
                            <span className="tooltip">Dashboard</span>
                        </li>
                        <li>
                            <NavLink to="/classes">
                            <i class='bx bxs-chalkboard'></i>
                             </NavLink>
                            <span className="tooltip">Classes</span>
                        </li>
                        <li>
                            <NavLink to="/viewTeachers">
                            <i class='bx bxs-user-rectangle'></i>
                            </NavLink>
                            <span className="tooltip">View Teachers</span>
                        </li>
                        <li>
                            <NavLink to="/viewStudents">
                            <i class='bx bxs-user-account'></i>
                            </NavLink>
                            <span className="tooltip">View Students</span>
                        </li>
                        <li>
                            <NavLink to="/viewModules">
                            <i class='bx bxs-book'></i>
                            </NavLink>
                            <span className="tooltip">View Modules</span>
                        </li>
                        <li>
                            <NavLink to="/viewAttendance ">
                            <i class='bx bxs-book-open'></i>
                            </NavLink>
                            <span className="tooltip">View Attendance</span>
                        </li>
                        <li>
                            <NavLink to="/viewSections">
                            <i class='bx bxs-checkbox-minus'></i>
                            </NavLink>
                            <span className="tooltip">View Section</span>
                        </li>
                        <li className="profile">
                            <button className='logout' onClick={handleLogout}>
                                <i className='bx bx-log-out' style={{ color: 'red', margin_button: "20px" }}></i>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
    
        );
    }
    else if(userRole === "teacher"){
        return (
            
            <div>
                
                <div className="sidebar">
                    <div className="logo-details">
                        <i className='bx bxl-c-plus-plus icon'></i>
                        <i className='bx bx-menu' id="btn"></i>
                    </div>
                    <ul className="nav-list">
                        <li>
                            <NavLink to="/">
                                <i className='bx bx-grid-alt'></i>
                            </NavLink>
                            <span className="tooltip">Dashboard</span>
                        </li>
                        <li>
                        <NavLink to="/classes">
                            <i class='bx bxs-chalkboard'></i>
                             </NavLink>
                            <span className="tooltip">Classes</span>
                        </li>
                        <li>
                            <NavLink to="/viewSections">
                                <i className='bx bx-transfer-alt'></i>
                            </NavLink>
                            <span className="tooltip"> View Sections</span>
                        </li>
                        <li>
                            <NavLink to="/viewAttendance ">
                            <i class='bx bxs-book-open'></i>
                            </NavLink>
                            <span className="tooltip">View Attendance</span>
                        </li>
                        <li className="profile">
                            <button className='logout' onClick={handleLogout}>
                                <i className='bx bx-log-out' style={{ color: 'red' }}></i>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
    
        )
    }
        
    else if (userRole === "student"){
        return (

            <div>
                    
                <div className="sidebar">
                    <div className="logo-details">
                        <i className='bx bxl-c-plus-plus icon'></i>
                        <i className='bx bx-menu' id="btn"></i>
                    </div>
                    <ul className="nav-list">
                        <li>
                            <NavLink to="/">
                                <i className='bx bx-grid-alt'></i>
                            </NavLink>
                            <span className="tooltip">Dashboard</span>
                        </li>
                        <li>
                        <NavLink to="/classes">
                            <i class='bx bxs-chalkboard'></i>
                             </NavLink>
                            <span className="tooltip">Classes</span>
                        </li>
                        <li>
                            <NavLink to="/viewTeachers">
                                <i className='bx bx-transfer-alt'></i>
                            </NavLink>
                            <span className="tooltip">View Teachers</span>
                        </li>
                        <li>
                        <NavLink to="/viewAttendance">
                            <i class='bx bxs-book-open'></i>
                            </NavLink>
                            <span className="tooltip">View Attendance</span>
                        </li>
                        <li>
                            <NavLink to="/viewModules">
                                <i className='bx bx-user'></i>
                            </NavLink>
                            <span className="tooltip">View Modules</span>
                        </li>

                        <li className="profile">
                            <button className='logout' onClick={handleLogout}>
                                <i className='bx bx-log-out' style={{ color: 'red', margin_button: "20px" }}></i>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
    
        )
    }
    else{
        return(
            <div>
                No user at the side bar
            </div>
        )
    }
    

};

export default SidebarComponent
