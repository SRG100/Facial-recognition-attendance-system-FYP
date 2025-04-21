import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import SidebarComponent from '../components/SideBar'
import { toast } from 'react-hot-toast'
import PageNotFound from '../components/PageNotFound'
import Header from '../components/Header'
import ComponentCard from '../components/ComponentCard'

const VerifyLocation = ({ userId, userRole, userName }) => {
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
    const fromNavigate = location.state?.fromNavigate
    if (!fromNavigate) {
        return <PageNotFound />
    }


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
        setLoading(true)
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                setLoading(false);
                toast.error("Geolocation not supported");
                reject(new Error("Geolocation not supported"));
                return;
            }

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
                navigate('/', 1000)
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
                // toast.success(response.data.message || "Verified Successfully")
                console.log("Location verified")
            } else {
                toast.error(response.data.message || "Verification failed")
            }
        } catch (err) {
            console.error("Error verifying location:", err);
            toast.error("Error verifying location. Please try again later.");
        }
    };

    const startVerification = () => {
        setVerificationActive(true)
        verifyLocation()
        checkClassCompletion()
    }
    

    return (
        <div className="d-flex">
            {!verificationActive && (
                                    <SidebarComponent userRole={userRole} />
                                )}
            
            <div className='home-section'>
                <Header userName={userName} userRole={userRole} />
                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">

                    <div className="flex items-center justify-center w-full py-8 px-4">
                        <div className="w-full md:w-4/5 lg:w-3/5 xl:w-2/5 bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                
                                <h2 className="text-center text-black font-bold text-2xl flex items-center justify-center">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    Location Verification
                                </h2>

                                <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 mt-5 text-amber-800">

                                    <h3 className="font-bold text-lg mb-2 flex items-center">
                                        <span className="text-amber-500 mr-2">ℹ️</span>
                                        Guidelines
                                    </h3>
                                    <ul className="space-y-2">
                                        <li className="flex items-start">
                                            <span className="text-green-500 mr-2">✅</span>
                                            <span>Be within <strong>50 meters</strong> of your teacher's location</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-red-500 mr-2">🚨</span>
                                            <span>You will receive <strong>3 warnings</strong> before class ends</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-amber-500 mr-2">❗</span>
                                            <span><strong>Do not close this page</strong></span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="text-blue-500 mr-2">📘</span>
                                            <span>Happy learning!</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Distance indicator */}
                                {distance !== null && (
                                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-blue-700">Your current distance:</span>
                                            <span className="text-blue-800 font-bold text-lg">{distance.toFixed(2)} meters</span>
                                        </div>

                                        {/* Distance visualization */}
                                        <div className="mt-3 relative h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`absolute top-0 left-0 h-full rounded-full ${distance <= 50 ? 'bg-green-500' : 'bg-red-500'}`}
                                                style={{ width: `${Math.min(100, (distance / 100) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0m</span>
                                            <span>50m</span>
                                            <span>100m+</span>
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex justify-center">
                                    {!verificationActive ? (
                                        <button
                                            onClick={startVerification}
                                            disabled={loading}
                                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center ${loading
                                                ? 'bg-blue-400 cursor-wait text-white'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                                                }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Locating...
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                                    </svg>
                                                    Start Verification
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="bg-green-50 border-l-4 border-green-400 p-4 w-full rounded-lg">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm text-green-700">
                                                        Location is being verified every 10 seconds
                                                    </p>
                                                    <div className="mt-2 flex items-center">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                                                        <span className="text-xs text-green-600">Monitoring active</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className='home-section'>

            </div>
        </div>
    )
}

export default VerifyLocation
