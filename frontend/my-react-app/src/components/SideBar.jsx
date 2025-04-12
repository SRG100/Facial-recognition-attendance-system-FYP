import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import "boxicons/css/boxicons.min.css";
import fras from '../assets/Fras.png'
const BoxIcon = ({ iconName, className = "" }) => (
  <i className={`bx ${iconName} ${className} text-2xl`}></i>
);

const SideBar = ({ userId, userRole }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const location = useLocation();

  const menuItems = {
    admin: [
      { name: "Dashboard", icon: <BoxIcon iconName="bx-grid-alt" />, path: "/" },
      { name: "Classes", icon: <BoxIcon iconName="bxs-chalkboard" />, path: "/classes" },
      { name: "View Teachers", icon: <BoxIcon iconName="bxs-user-rectangle" />, path: "/viewTeachers" },
      { name: "View Students", icon: <BoxIcon iconName="bxs-user-account" />, path: "/viewStudents" },
      { name: "View Modules", icon: <BoxIcon iconName="bxs-book" />, path: "/viewModules" },
      { name: "View Sections", icon: <BoxIcon iconName="bxs-checkbox-minus" />, path: "/viewSections" }
    ],
    teacher: [
      { name: "Dashboard", icon: <BoxIcon iconName="bx-grid-alt" />, path: "/" },
      { name: "Classes", icon: <BoxIcon iconName="bxs-chalkboard" />, path: "/classes" },
      { name: "View Sections", icon: <BoxIcon iconName="bx-transfer-alt" />, path: "/viewSections" },
    ],
    student: [
      { name: "Dashboard", icon: <BoxIcon iconName="bx-grid-alt" />, path: "/" },
      { name: "Classes", icon: <BoxIcon iconName="bxs-chalkboard" />, path: "/classes" },
      { name: "View Teachers", icon: <BoxIcon iconName="bx-transfer-alt" />, path: "/viewTeachers" },
      { name: "View Modules", icon: <BoxIcon iconName="bx-user" />, path: "/viewModules" },
      { name: "View Attendance", icon: <BoxIcon iconName="bx-book-open" />, path: "/viewAttendance" }
    ]
  };

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const response = await axios.get('http://localhost:3000/auth/isAuthorized', { withCredentials: true });
        const isVerified = response.data?.success;
        const userName = response.data?.userName;

        setUserName(userName);
        setIsLoggedIn(isVerified);

        const justLoggedIn = localStorage.getItem("justLoggedIn");
        if (isVerified && justLoggedIn === "true") {
          toast.success(`Welcome back, ${userName}!`);
          localStorage.removeItem("justLoggedIn");
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
        setIsLoggedIn(false);
        toast.error("Authorization failed. Please login.");
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
          window.location.reload();
        }, 500);
      } else {
        console.error("Logout failed:", response.data.message);
        toast.error("Logout failed. Please try again.");
      }
    } catch (err) {
      console.log("error while logging out", err);
      toast.error("Something went wrong during logout.");
    }
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    setIsMobileOpen(!isMobileOpen);
  };

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  if (!isLoggedIn) return null;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`py-8 flex lg:justify-center `}>
        <div className="logo-details">
          
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex w-full">
              <img
                className="dark:hidden"
                src={fras}
                alt="Logo"
                width={50}
                height={40}
              />
                          <div className="logo-name text-2xl text-center" style={{ color: "#4a48ac" }}>GCA</div>

            </div>
          ) : (
            <img
              src={fras}
              alt="Logo"
              width={32}
              height={32}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}>
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <BoxIcon iconName="bx-dots-horizontal" className="size-6" />}
              </h2>
              <ul className="flex flex-col gap-4">
                {menuItems[userRole]?.map((item, index) => (
                  <li key={index}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `menu-item group ${
                        isActive ? "menu-item-active" : "menu-item-inactive"
                      } cursor-pointer ${
                        !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                      }`}
                    >
                      <span className={`menu-item-icon-size ${
                        isActive(item.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                      }`}>
                        {item.icon}
                      </span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="menu-item-text">{item.name}</span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
{/*         
        {(isExpanded || isHovered || isMobileOpen) && (
          <div className="profile mt-auto mb-4 p-3 border-t border-gray-200 dark:border-gray-800">
            <div className="profile-details flex items-center justify-between">
              <div className="name-job">
                <div className="name font-semibold">{userName}</div>
                <div className="job text-sm text-gray-500 capitalize">{userRole}</div>
              </div>
              <button 
                className="logout-btn p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" 
                onClick={handleLogout}
              >
                <BoxIcon iconName="bx-log-out" />
              </button>
            </div>
          </div>
        )} */}
      </div>
    </aside>
  );
};

export default SideBar;