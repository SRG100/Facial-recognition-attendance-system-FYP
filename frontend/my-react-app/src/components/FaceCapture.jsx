import React from 'react';
import Webcam from 'react-webcam';

export const FaceCapture = ({ image, setImage }) => {
  const videoConstraints = {
    width: 800,
    height: 450,
    facingMode: 'user'
  };

  const webcamRef = React.useRef(null);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [setImage]);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      <div
        className="border rounded-4 overflow-hidden shadow-sm mb-3"
        style={{ maxWidth: '800px', width: '100%' }}
      >
        <div className="w-100">
          {image === '' ? (
            <Webcam
              audio={false}
              height={450}
              width={800}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="img-fluid"
              style={{ borderRadius: '1rem' }}
            />
          ) : (
            <img src={image} alt="Captured" className="img-fluid rounded-4" />
          )}
        </div>
      </div>

      <div>
        {image !== '' ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              setImage('');
            }}
            className="btn btn-outline-primary"
          >
            Retake Image
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.preventDefault();
              capture();
            }}
            className="btn btn-primary"
          >
            Capture
          </button>
        )}
      </div>
    </div>
  );
};

export default FaceCapture;
