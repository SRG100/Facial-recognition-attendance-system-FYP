import React , { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios'
import "../assets/SideBar.css"
{ useState, useEffect }

const SidebarComponent = () => {
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
                            <i className='bx bxs-message-square-add'></i>
                        </NavLink>
                        <span className="tooltip">Classes</span>
                    </li>
                    <li>
                        <NavLink to="viewtransactions">
                            <i className='bx bx-transfer-alt'></i>
                        </NavLink>
                        <span className="tooltip">View Transactions</span>
                    </li>
                    <li>
                        <NavLink to="viewdebt">
                            <i className='bx bx-credit-card'></i>
                        </NavLink>
                        <span className="tooltip">View Debt Detail</span>
                    </li>
                    <li>
                        <NavLink to="userDetails">
                            <i className='bx bx-user'></i>
                        </NavLink>
                        <span className="tooltip">User</span>
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

};

export default SidebarComponent
