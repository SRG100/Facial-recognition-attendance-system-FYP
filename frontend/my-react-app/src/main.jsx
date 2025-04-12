import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx'
import 'boxicons/css/boxicons.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {Toaster} from "react-hot-toast"


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster position="top-center"
        toastOptions={{
          // Duration in milliseconds
          duration: 5000
        }}/>
  </StrictMode>,
)
