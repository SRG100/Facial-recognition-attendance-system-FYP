from flask import Flask,jsonify,request
from flask_cors import CORS
import face_recognition
import cv2
from io import BytesIO 
import base64
import numpy as np
from PIL import Image


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}})

def base64_to_image(base64_string):
    if base64_string.startswith('data:image/jpeg;base64,'):
        base64_string = base64_string.split(",")[1] 

    image_data = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_data)) 
    image = image.convert('RGB') 
    return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

def verify_face(registeredFace,providedFace):

        registeredRGB=cv2.cvtColor(registeredFace, cv2.COLOR_BGR2RGB)
        uploadedFaceRGB=cv2.cvtColor(providedFace, cv2.COLOR_BGR2RGB)

        registeredFaceEncoding =face_recognition.face_encodings(registeredRGB)
        uploadedFaceEncoding = face_recognition.face_encodings(uploadedFaceRGB)

        if not registeredFaceEncoding :
            return False, "No face detected in one or both images"


        result = face_recognition.compare_faces([registeredFaceEncoding[0]],uploadedFaceEncoding[0])
        print(result)

        return result[0], "Face match" if result[0] else "Face does not match"

@app.route("/verifyFace", methods=['POST'])

def verifyFace():
    # try:
        print("Verifying face...") 
        data = request.get_json()
        
        if "uploadedImage" not in data or "registeredImage" not in data:
            print("No uploaded image")
            return jsonify({"error": "Missing image data"}), 400

        uploaded_image = base64_to_image(data["uploadedImage"])
        registered_image = base64_to_image(data["registeredImage"])
        verified = verify_face(registered_image,uploaded_image)
        print(f"The face verification result is:",verified)
        return jsonify({"verified": bool(verified[0])})

   
if __name__ == "__main__":
    app.run(debug=True)
