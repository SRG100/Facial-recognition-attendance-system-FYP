import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import SidebarComponent from '../components/SideBar'
import { toast } from 'react-hot-toast'

const VerifyLocation = ({ userId, userRole }) => {
    const [loading, setLoading] = useState(false)
    const [distance, setDistance] = useState(null)
    const [success, setSuccess] = useState(true)
    const [verified, setVerified] = useState(true)
    const [message, setMessage] = useState('')
    const [verificationActive, setVerificationActive] = useState(false)
    const [classCompletion, setClassCompletion] = useState(0)

    const navigate = useNavigate()
    const location = useLocation()
    const Class_Id = location.state?.Class_Id
    const Attendance_id = location.state?.Attendance_id


    useEffect(() => {
        if (!success && message) {
            toast.error(message);
            setTimeout(() => navigate("/"), 3000)
        }
    }, [success, message, navigate])

    useEffect(() => {
        let interval
        if (verificationActive && classCompletion !== 1) {
            interval = setInterval(() => {
                verifyLocation()
                checkClassCompletion()
            }, 10000)
        }
        return () => clearInterval(interval)
    }, [verificationActive, classCompletion])

    const getUserLocation = async () => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            // if (!navigator.geolocation) {
            //     setLoading(false);
            //     toast.error("Geolocation not supported");
            //     reject(new Error("Geolocation not supported"));
            //     return;
            // }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLoading(false);
                    resolve({ latitude, longitude });
                },
                (error) => {
                    setLoading(false);
                    toast.error("Error getting location: " + error.message);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    const checkClassCompletion = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/verification/locationData?Class_Id=${Class_Id}`)
            setClassCompletion(response.data.classCompletion)

            if (response.data.classCompletion === 1) {
                toast.success("Class has ended!")
                setVerificationActive(false)
                navigate('/',1000)
            }
        } catch (error) {
            toast.error("Error checking class status")
        }
    };

    const verifyLocation = async () => {
        try {
            const studentLocation = await getUserLocation()
            if (!studentLocation) return

            const { longitude: studentLongitude, latitude: studentLatitude } = studentLocation
            const response = await axios.get(`http://localhost:3000/verification/locationVerification?Class_Id=${Class_Id}&studentLongitude=${studentLongitude}&studentLatitude=${studentLatitude}&Attendance_id=${Attendance_id}`)

            setDistance(response.data?.distance)
            setSuccess(response.data?.success)
            setVerified(response.data?.verified)
            setMessage(response.data?.message)

            if (response.data?.verified) {
                toast.success(response.data.message || "Verified Successfully")
            } else {
                toast.error(response.data.message || "Verification failed")
            }
        } catch (err) {
            toast.error("Error verifying location");
        }
    };

    const startVerification = () => {
        setVerificationActive(true)
        verifyLocation()
        checkClassCompletion()
    };

    return (
        <div className="d-flex">
            <SidebarComponent userRole={userRole} />
            {verificationActive && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '78px',
                        height: '100vh',
                        backgroundColor: 'rgba(255,255,255,0.6)',
                        backdropFilter: 'blur(2px)',
                        zIndex: 10,
                        cursor: 'not-allowed'
                    }}
                />
            )}

<div className='home-section'>
            <div className=" container mt-4 ms-4">
                <h2 className="mb-3">📍 Location Verification</h2>

                <div className="alert alert-warning" role="alert">
                    ✅ Be within <strong>50 meters</strong> of your teacher's location. <br />
                    🚨 You will receive <strong>3 warnings</strong> before class ends. <br />
                    ❗ <strong>Do not close this page.</strong><br />
                    📘 Happy learning!
                </div>

                {distance !== null && (
                    <div className="alert alert-info">
                        Your distance: <strong>{distance.toFixed(2)} meters</strong>
                    </div>
                )}

                {!verificationActive ? (
                    <button
                        className="btn btn-primary"
                        onClick={startVerification}
                        disabled={loading}
                    >
                        {loading ? "Locating..." : "Start Verification"}
                    </button>
                ) : (
                    <div className="alert alert-success mt-3">
                        Location is being verified every 10 seconds...
                    </div>
                )}
            </div>
            </div>
        </div>
    )
}

export default VerifyLocation
