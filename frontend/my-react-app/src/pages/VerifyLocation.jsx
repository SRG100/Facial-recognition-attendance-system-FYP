import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import SidebarComponent from '../components/SideBar';

const VerifyLocation = ({ userId, userRole }) => {
    const [loading, setLoading] = useState(false);
    const [distance, setDistance] = useState(null);
    const [verificationActive, setVerificationActive] = useState(false);
    const [classCompletion, setClassCompletion] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();
    const Class_Id = location.state?.Class_Id;
    const Attendance_id = location.state?.Attendance_id;

    useEffect(() => {
        let interval;

        if (verificationActive && classCompletion !== 1) {
            interval = setInterval(() => {
                verifyLocation();
                checkClassCompletion();
            }, 5000); // Runs every 5 seconds
        }

        return () => clearInterval(interval); // Cleanup on unmount
    }, [verificationActive, classCompletion]);

    const getUserLocation = async () => {
        setLoading(true);
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                console.error("Geolocation is not supported by this browser.");
                setLoading(false);
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
                    console.error("Error getting user location:", error);
                    setLoading(false);
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
            const response = await axios.get(`http://localhost:3000/verification/locationData?Class_Id=${Class_Id}`);
            setClassCompletion(response.data.classCompletion);

            if (response.data.classCompletion === 1) {
                setVerificationActive(false);
                console.log("Class is completed. Stopping verification.");
            }
        } catch (error) {
            console.error("Error checking class completion:", error);
        }
    };

    const verifyLocation = async () => {
        try {
            const studentLocation = await getUserLocation();
            if (!studentLocation) return;

            const { longitude: studentLongitude, latitude: studentLatitude } = studentLocation;
            const response = await axios.get(`http://localhost:3000/verification/locationVerification?Class_Id=${Class_Id}&studentLongitude=${studentLongitude}&studentLatitude=${studentLatitude}&Attendance_id=${Attendance_id}`);

            setDistance(response.data?.distance);
            console.log("Verification response:", response.data);

        } catch (err) {
            console.error("Error while verifying location:", err);
        }
    };

    const startVerification = () => {
        setVerificationActive(true);
        verifyLocation(); // Start immediately before intervals
        checkClassCompletion();
    };

    return (
        <div>
            <SidebarComponent userRole={userRole} />
            <h2>Code Verification</h2>
            <p>Now, code verification step</p>

            {distance !== null && <div>Distance: {distance} meters</div>}

            {!verificationActive ? (
                <button onClick={startVerification}>Start Verification</button>
            ) : (
                <p>Verifying location every 5 seconds...</p>
            )}
        </div>
    );
};

export default VerifyLocation
