
import React, { useState } from 'react';
import Webcam from "react-webcam";



export const FaceCapture = ({image,setImage}) => {

    const videoConstraints = {
        width: 800,
        height: 450,  
        facingMode: "user"
    };
    
    const webcamRef = React.useRef(null);

    
    const capture = React.useCallback(
        () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc)
        },[setImage]);


    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">

        <div className="webcam-container">
            <div className="webcam-img">

                {image == '' ? <Webcam
                    audio={false}
                    height={450}
                    width={800}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                /> : <img src={image} />}
            </div>
            <div>
                {image != '' ?
                    <button onClick={(e) => {
                        e.preventDefault();
                        setImage('')
                    }}
                        className="btn btn-success">
                        Retake Image</button> :
                    <button onClick={(e) => {
                        e.preventDefault();
                        capture();
                    }}
                        className="btn btn-success">Capture</button>
                }
            </div>
        </div>
        </div>
    );
};
export default FaceCapture
