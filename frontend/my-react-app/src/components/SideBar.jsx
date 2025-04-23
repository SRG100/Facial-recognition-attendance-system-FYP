import { useCallback, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import '../assets/SideBar-light.css';

const BoxIcon = ({ iconName, className = "" }) => (
  <i className={`bx ${iconName} ${className} text-2xl`}></i>

);

const SideBar = ({ userId, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const location = useLocation();

  const menuItems = {
    admin: [
      { name: "Dashboard", icon: <BoxIcon iconName="bxs-home-circle" />, path: "/" },
      { name: "Classes", icon: <BoxIcon iconName="bxs-chalkboard" />, path: "/classes" },
      { name: "View Teachers", icon: <BoxIcon iconName="bxs-user-rectangle" />, path: "/viewTeachers" },
      { name: "View Students", icon: <BoxIcon iconName="bxs-user-account" />, path: "/viewStudents" },
      { name: "View Modules", icon: <BoxIcon iconName="bxs-book" />, path: "/viewModules" },
      { name: "View Sections", icon: <BoxIcon iconName="bxs-checkbox-minus" />, path: "/viewSections" }
    ],
    teacher: [
      { name: "Dashboard", icon: <BoxIcon iconName="bxs-home-circle" />, path: "/" },
      { name: "Classes", icon: <BoxIcon iconName="bxs-chalkboard" />, path: "/classes" },
      { name: "View Sections", icon: <BoxIcon iconName="bxs-checkbox-minus" />, path: "/viewSections" },
    ],
    student: [
      { name: "Dashboard", icon: <BoxIcon iconName="bxs-home-circle" />, path: "/" },
      { name: "Classes", icon: <BoxIcon iconName="bxs-chalkboard" />, path: "/classes" },
      { name: "View Teachers", icon: <BoxIcon iconName="bxs-user-rectangle" />, path: "/viewTeachers" },
      { name: "View Modules", icon: <BoxIcon iconName="bxs-book" />, path: "/viewModules" },
      { name: "View Attendance", icon: <BoxIcon iconName="bx-book-open" />, path: "/viewAttendance" }
    ]
  };

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/isAuthorized', { withCredentials: true })
        const isVerified = response.data?.success
        const userName = response.data?.userName

        setUserName(userName)
        setIsLoggedIn(isVerified)

        const justLoggedIn = localStorage.getItem("justLoggedIn")
        if (isVerified && justLoggedIn === "true") {
          toast.success(`Welcome back, ${userName}!`)
          localStorage.removeItem("justLoggedIn")
        }
      } catch (error) {
        console.error('Error checking authorization:', error)
        setIsLoggedIn(false);
        toast.error("Authorization failed. Please login.")
      }
    };

    checkAuthorization()
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
        toast.error("Logout failed. Please try again.");
      }
    } catch (err) {
      console.log("error while logging out", err);
      toast.error("Something went wrong during logout.");
    }
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  }


  if (!isLoggedIn) return null;

  return (
    
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="logo-details">
          {/* <img src={fras} alt="Logo" className="icon" /> */}
          <div className="logo-name">Menu</div>
          {isOpen ? (
            <i className='bx bx-x' onClick={toggleSidebar}></i>
          ) : (
            <i className='bx bx-menu' onClick={toggleSidebar}></i>
          )}
        </div>

        <ul className="nav-list">
          {menuItems[userRole]?.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <i className={`bx ${item.icon.props.iconName}`}></i>
                <span className="links-name">{item.name}</span>
              </NavLink>
              {!isOpen && <span className="tooltip">{item.name}</span>}
            </li>
          ))}

          <li className="profile">
            <div className="profile-details">
              <div className="name-job">
                <div className="name">{userName}</div>
                <div className="job">{userRole}</div>
              </div>
              <button
                className="logout-btn p-2 rounded-full hover:bg-red-100 hover:text-red-600 hover:bg-red-900 dark:hover:text-red-300 transition-colors"
                onClick={handleLogout}
                aria-label="Logout"
                title="Logout"
              >
                <i className='bx bx-log-out text-xl'></i>
              </button>
            </div>
          </li>
        </ul>
      </div>
    
  );
};

export default SideBar;