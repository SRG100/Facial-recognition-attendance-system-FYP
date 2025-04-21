import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import FaceCapture from '../components/FaceCapture.jsx';
import SidebarComponent from '../components/SideBar.jsx'
import PageNotFound from '../components/PageNotFound.jsx';
import Header from '../components/Header.jsx';
import ComponentCard from '../components/ComponentCard.jsx';

const CheckFace = ({ userId, userRole, userName }) => {
  const [faceImgRegister, setFaceImgRegister] = useState('')
  const [image, setImage] = useState('')
  const [registeredFace, setRegisteredFace] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()
  const fromNavigate = location.state?.fromNavigate
  // if (!fromNavigate) {
  //   return <PageNotFound />
  // }
  const Class_Id = location.state?.Class_Id
  const Attendance_id = location.state?.Attendance_id

  useEffect(() => {
    const getFaceDetails = async () => {
      try {
        const response = await axios.post(
          'http://localhost:3000/face/getFace',
          { userId }
        );
        const faceData = response.data;
        const base64Image = `data:image/jpeg;base64,${faceData.faceData}`;
        const base64Img = faceData.faceData;
        setFaceImgRegister(base64Image);
        setRegisteredFace(base64Img);
      } catch (error) {
        toast.error('Failed to fetch registered face data');
        console.error('Error while getting face details:', error);
      }
    };

    if (userId) {
      getFaceDetails();
    }
  }, [userId]);

  const VerifyFace = async () => {
    try {
      toast.loading('Verifying your face...', { id: 'verifying' });

      const response = await axios.post(
        'http://127.0.0.1:5000/verifyFace',
        {
          uploadedImage: image,
          registeredImage: registeredFace
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const verified = response.data.verified

      toast.dismiss('verifying')

      if (verified) {
        toast.success('Face verified successfully!')
        await axios.get(
          `http://localhost:3000/verification/faceVerified?Attendance_id=${Attendance_id}`
        );
        navigate('/verifylocation', { state: { Class_Id, Attendance_id, fromNavigate: true } })
      } else {
        toast.error('Face not verified. Please try again.')
      }
    } catch (error) {
      toast.dismiss('verifying');
      toast.error('Something went wrong during verification.')
      console.error('Error during face verification:', error)
    }
  }


  return (
    <div className="d-flex">
      <div className="d-flex min-vh-100 bg-light">
        <SidebarComponent userRole={userRole} />
        <div className='home-section'>
          <Header userName={userName} userRole={userRole} />
          <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
            <div className="max-w mx-auto  px-4 sm:px-6 lg:px-8"></div>
            <ComponentCard title="Attendance Verification" description="Verify your attendance using the code provided by your teacher.">
              <div className="container-fluid d-flex flex-column justify-content-center align-items-center py-5">
                <h2 className="text-center text-primary mb-4 fw-bold">Face Verification</h2>
                <p className="text-muted text-center mb-4">
                  Please capture your live image and verify your face with the registered data.
                </p>

                <FaceCapture image={image} setImage={setImage} />
                {image !== '' && (
                  <div className="flex justify-center mt-6">
                    <button className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                      onClick={VerifyFace}>
                      Verify Face
                    </button>
                  </div>
                )}
              </div>
            </ComponentCard>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CheckFace;
