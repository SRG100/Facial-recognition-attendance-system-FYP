import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import FaceCapture from '../components/FaceCapture.jsx';
import SidebarComponent from '../components/SideBar.jsx'
import PageNotFound from '../components/PageNotFound.jsx';

const CheckFace = ({ userId, userRole }) => {
  const [faceImgRegister, setFaceImgRegister] = useState('')
  const [image, setImage] = useState('')
  const [registeredFace, setRegisteredFace] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()
  const fromNavigate = location.state?.fromNavigate
  if (!fromNavigate) {
    return <PageNotFound />
}
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
        navigate('/verifylocation', { state: { Class_Id, Attendance_id, fromNavigate:true } })
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
      <SidebarComponent userRole={userRole} />
      <div className="container-fluid d-flex flex-column justify-content-center align-items-center py-5">
        <h2 className="text-center text-primary mb-4 fw-bold">Face Verification</h2>
        <p className="text-muted text-center mb-4">
          Please capture your live image and verify your face with the registered data.
        </p>

        <div className="shadow rounded-4 p-4 bg-white w-100" style={{ maxWidth: '950px' }}>
          <FaceCapture image={image} setImage={setImage} />
          {image !== '' && (
            <div className="d-flex justify-content-center mt-4">
              <button className="btn btn-success" onClick={VerifyFace}>
                Verify Face
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckFace;
