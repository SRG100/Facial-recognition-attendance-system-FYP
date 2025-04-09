import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'boxicons/css/boxicons.min.css'
import '../assets/SideBar-light.css'

const SidebarComponent = ({ userId, userRole }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userName, setUserName] = useState()
    useEffect(() => {
        const checkAuthorization = async () => {
            try {
                const response = await axios.get('http://localhost:3000/auth/isAuthorized', { withCredentials: true });
                const isVerified = response.data?.success
                const userName = response.data?.userName
    
                setUserName(userName);
                setIsLoggedIn(isVerified);
    
                const justLoggedIn = localStorage.getItem("justLoggedIn");
                if (isVerified && justLoggedIn === "true") {
                    toast.success(`Welcome back, ${userName}!`)
                    localStorage.removeItem("justLoggedIn")
                }
    
            } catch (error) {
                console.error('Error checking authorization:', error)
                setIsLoggedIn(false)
                toast.error("Authorization failed. Please login.")
            }
        };
    
        checkAuthorization();
    }, []);
    
    const handleLogout = async () => {
        try {
            const response = await axios.get('http://localhost:3000/auth/logout', { withCredentials: true });
            if (response.data.success) {
                toast.success(response.data.message || "Logged out successfully.");
                setTimeout(() => {
                    window.location.reload()
                }, 500)
            } else {
                console.error("Logout failed:", response.data.message);
                toast.error("Logout failed. Please try again.")
            }
        } catch (err) {
            console.log("error while logging out", err)
            toast.error("Something went wrong during logout.")
        }
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    }

    const renderSidebarContent = () => {
        const menuItems = {
            admin: [
                { to: "/", icon: "bx-grid-alt", tooltip: "Dashboard" },
                { to: "/classes", icon: "bxs-chalkboard", tooltip: "Classes" },
                { to: "/viewTeachers", icon: "bxs-user-rectangle", tooltip: "View Teachers" },
                { to: "/viewStudents", icon: "bxs-user-account", tooltip: "View Students" },
                { to: "/viewModules", icon: "bxs-book", tooltip: "View Modules" },
                { to: "/viewSections", icon: "bxs-checkbox-minus", tooltip: "View Section" }
            ],
            teacher: [
                { to: "/", icon: "bx-grid-alt", tooltip: "Dashboard" },
                { to: "/classes", icon: "bxs-chalkboard", tooltip: "Classes" },
                { to: "/viewSections", icon: "bx-transfer-alt", tooltip: "View Sections" },
            ],
            student: [
                { to: "/", icon: "bx-grid-alt", tooltip: "Dashboard" },
                { to: "/classes", icon: "bxs-chalkboard", tooltip: "Classes" },
                { to: "/viewTeachers", icon: "bx-transfer-alt", tooltip: "View Teachers" },
                { to: "/viewModules", icon: "bx-user", tooltip: "View Modules" },
                { to: "/viewAttendance", icon: "bx-book-open", tooltip: "View Attendance" }
            ]
        };

        return (
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="logo-details">
                    <div className="logo-name" style={{ color: "#4a48ac" }}>Attendance System</div>
                    <i 
                        className={`bx ${isOpen ? 'bx-x' : 'bx-menu'}`} 
                        id="btn"
                        onClick={toggleSidebar}
                    ></i>
                </div>
                <ul className="nav-list">
                    {menuItems[userRole]?.map((item, index) => (
                        <li key={index}>
                            <NavLink to={item.to} className="nav-link">
                                <i className={`bx ${item.icon}`}></i>
                                <span className="links-name">{item.tooltip}</span>
                            </NavLink>
                            <span className="tooltip">{item.tooltip}</span>
                        </li>
                    ))}
                    <li className="profile">
                        <div className="profile-details">
                            <div className="name-job">
                                <div className="name">{userName}</div>
                                <div className="job">{userRole}</div>
                            </div>
                            <button 
                                className="logout-btn buttonCss" 
                                onClick={handleLogout}
                            >
                                <i className='bx bx-log-out'></i>
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        );
    };

    return isLoggedIn ? renderSidebarContent() : null;
};

export default SidebarComponent;
