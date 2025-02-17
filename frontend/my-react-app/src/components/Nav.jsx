import React , {useState, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Cookies from 'js-cookie';


const Nav = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        // Check if the token exists in cookies
        const token = Cookies.get('token');
        console.log("The cookies are",Cookies.get());

        console.log('the token is',token)
        if (token) {
          setIsLoggedIn(true);  // the user is logged in
        } else {
          setIsLoggedIn(false); // the user is not logged in
        }
      }, []);

      const handleLogout = () => {
        Cookies.remove('token'); // Remove token from cookies on logout
        setIsLoggedIn(false); // Update UI state to logged out
      };
      
  return (
    
    <div>
      <div>
      <Link to="/"> Home</Link>
      </div>
      
            {!isLoggedIn ? (
              <>
                <Link to="/login"> Login</Link> <br></br>
                <Link to="/register"> Register</Link>

              </>
            ) : (
              <button onClick={handleLogout}>Logout</button>
            )}

    </div>
    

  )
}

export default Nav