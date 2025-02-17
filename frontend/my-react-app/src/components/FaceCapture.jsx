
import React, { useState } from 'react';
import Webcam from "react-webcam";



export const FaceCapture = ({image,setImage}) => {

    const videoConstraints = {
        width: 520,
        height: 500,
        facingMode: "user"
    };

    
    const webcamRef = React.useRef(null);

    
    const capture = React.useCallback(
        () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc)
        },[setImage]);


    return (
        <div className="webcam-container">
            <div className="webcam-img">

                {image == '' ? <Webcam
                    audio={false}
                    height={500}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={500}
                    videoConstraints={videoConstraints}
                /> : <img src={image} />}
            </div>
            <div>
                {image != '' ?
                    <button onClick={(e) => {
                        e.preventDefault();
                        setImage('')
                    }}
                        className="webcam-btn">
                        Retake Image</button> :
                    <button onClick={(e) => {
                        e.preventDefault();
                        capture();
                    }}
                        className="webcam-btn">Capture</button>
                }
            </div>
        </div>
    );
};
export default FaceCapture
