import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import AttendanceImage from '../assets/Attendance.png'

const Login = () => {
    const navigate = useNavigate();

    const [values, setValues] = useState({
        email: '',
        password: '',
        role: ''
    })

    const handleChanges = (e) => {
        const { name, value } = e.target
        setValues({ ...values, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post('http://localhost:3000/auth/login', values, { withCredentials: true })
            if (response.status === 201) {
                localStorage.setItem("justLoggedIn", "true")
                if (response.data.success) {
                    toast.success(response.data.message)
                    navigate(response.data.redirect, { replace: true } )

                } else {
                    toast(response.data.message, { icon: '👏' })
                    navigate(response.data.redirect, { replace: true })

                }
                setTimeout(() => window.location.reload(), 500)
            } else {
                toast.error(response.data.message)
            }
        } catch (err) {
            console.log(err)
            toast.error(err.response?.data?.message || "Login failed")
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "100vh" }}>
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: "900px", width: "100%" }}>
                <div className="row g-0">
                    <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-gradient text-white" style={{background:"#98bad5"}}>
                        <img
                            src={AttendanceImage}
                            alt="Login Visual"
                            className="img-fluid p-4"
                            style={{ maxHeight: "420px" ,scale:"1.2" }}
                        />
                    </div>
                    <div className="col-md-6 bg-white">
                        <div className="p-5">
                            <h3 className="text-center mb-4 text-dark">Welcome Back 👋</h3>
                            <p className="text-center text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                                Please login to continue using the system.
                            </p>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="role" className="form-label fw-semibold">Select Role</label>
                                    <select
                                        name="role"
                                        value={values.role}
                                        onChange={handleChanges}
                                        required
                                        className="form-select rounded-3 py-2"
                                    >
                                        <option value="">Choose your role</option>
                                        <option value="admin">Admin</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="student">Student</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={values.email}
                                        onChange={handleChanges}
                                        required
                                        className="form-control rounded-3 py-2"
                                        placeholder="you@example.com"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label fw-semibold">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={values.password}
                                        onChange={handleChanges}
                                        required
                                        className="form-control rounded-3 py-2"
                                        placeholder="Enter your password"
                                    />
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn text-white py-2 rounded-3 fw-semibold"
                                        style={{background:"#98bad5"}}
                                    >
                                        Login
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
