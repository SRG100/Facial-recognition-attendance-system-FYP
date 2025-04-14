import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';

const FaceCapture = ({ image: propImage, setImage: propSetImage }) => {
  // Handle both prop-based and internal state
  const [internalImage, setInternalImage] = useState('');
  const image = propImage !== undefined ? propImage : internalImage;
  const setImage = propSetImage || setInternalImage;

  const webcamRef = useRef(null);

  const videoConstraints = {
    facingMode: 'user',
    aspectRatio: 16/9
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [setImage]);

  return (
    <div>
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          {image === '' && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <div className="absolute inset-0 border-2 border-white/30 rounded-xl m-6 md:m-8"></div>
              <div className="absolute top-4 right-4 flex items-center text-white text-sm bg-black/50 px-2 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                <span>Camera active</span>
              </div>
            </div>
          )}
          
          <div className="aspect-[16/9] w-full relative">
            {image === '' ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                mirrored={true}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img
                src={image}
                alt="Captured"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
          {image === '' && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center">
              <div className="text-white text-sm px-3 py-1 bg-black/60 rounded-full">
                Position your face in the frame and avoid bright lights in the background
                </div>
              </div>
          )}
        </div>
        <div className="mt-6 flex justify-center">
          {image !== '' ? (
            <div className="flex space-x-4">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setImage('');
                }}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
                >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Retake Photo
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.preventDefault()
                capture()
              }}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-800 transition-colors duration-150"
              >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              Take Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceCapture;