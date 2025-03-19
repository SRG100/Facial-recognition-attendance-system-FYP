import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import SidebarComponent from '../components/SideBar'

const VerifyLocation = ({ userId }) => {
    const [loading, setLoading] = useState(true)

    const [distance, setDistance] = useState(null)

    // const [code,setCode]=useState(null)
    const navigate = useNavigate()
    const location = useLocation()
    const Class_Id = location.state?.Class_Id
    const Attendance_id = location.state?.Attendance_id

    console.log("The class id git from join class is:", Class_Id)
    const [code, setCode] = useState({
        classCode: ''
    })
    const handleChanges = (e) => {
        const { name, value } = e.target
        setCode({
            ...code,
            [name]: value,
        })
    }
    const getUserLocation = async () => {
        setLoading(true)
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                console.error("Geolocation is not supported by this browser.")
                setLoading(false)
                reject(new Error("Geolocation not supported"))
                return;
            }
    
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setLoading(false)
                    resolve({ latitude, longitude })
                },
                (error) => {
                    console.error("Error getting user location:", error)
                    setLoading(false)
                    reject(error)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000, 
                    maximumAge: 0 
                }
            )
        })
    }
    const verifyLocation = async (e) => {
        e.preventDefault()
        try {
            const studentLocation = await getUserLocation()
            const studentLongitude = studentLocation.longitude
            const studentLatitude =studentLocation.latitude
            const response = await axios.get(`http://localhost:3000/verification/locationVerification?Class_Id=${Class_Id}&studentLongitude=${studentLongitude}&studentLatitude=${studentLatitude}&Attendance_id=${Attendance_id}`)
            const verified = response.data?.verified
            const distance = response.data?.codeVerified
            setDistance(distance)
            console.log(verified)
            if (verified) {

                alert("The location has been verified")
                // navigate("/checkface", { state: { Class_Id, Attendance_id } })

            }
            else {
                alert("You are too far from the teacher")

            }

        } catch (err) {
            console.log("Error while verifying class:", err)
        }
    }
    if(loading){
        <div>Loading location</div>
    }

    return (
        <div> 
            <SidebarComponent/>
            Code Verification <br />
            Now, code verification step

            <div>
            {distance && (
                <div>
                   the distance is :{distance}
                </div>

            )}
                    <button onClick={verifyLocation}> Verify Location</button>
                
            </div>
        </div>

    )
}

export default VerifyLocation