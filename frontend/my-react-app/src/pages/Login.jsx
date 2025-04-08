import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import AttendanceImage from '../assets/Attendance.png'

const Login = () => {
    const errorMessage = ''
    const navigate = useNavigate();

    const [values, setValues] = useState({
        email: '',
        password: '',
        role: ''
    })

    const handleChanges = (e) => {
        const { name, value } = e.target
        setValues({
            ...values,
            [name]: value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post('http://localhost:3000/auth/login', values, { withCredentials: true })
            console.log("Response:", response.data);
            if (response.status === 201) {
                if (response.data.redirect) {
                    if (response.data.success) {
                        toast.success(response.data.message)
                        navigate(response.data.redirect, { replace: true })
                        window.location.reload()
                    } else {
                        toast(response.data.message, { icon: '👏' })
                        navigate(response.data.redirect, { replace: true })
                        window.location.reload()
                    }
                }
            } else {
                toast.error(response.data.message)
            }
            console.log(response.data.message)
        } catch (err) {
            console.log(err)
            toast.error(err.response?.data?.message || "Login failed")
        }
    }

    return (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
            <div className="card shadow-lg border-0" style={{ maxWidth: "1000px", width: "100%" }}>
                <div className=" text-center py-3">
                    <h4 className="mb-0">Login to Your Account</h4>
                </div>
                <div className="row g-0">
                    <div className="col-md-5 d-flex align-items-center justify-content-center" >
                        <img
                            src={AttendanceImage}
                            alt="Login"
                            className="img-fluid p-3"
                            style={{ maxHeight: "1000px", scale: "1.5" }}
                        />
                    </div>

                    <div className="col-md-5">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="role" className="form-label" style={{ fontSize: '0.85rem', fontWeight: '400' }}>Role:</label>
                                    <select
                                        className="form-select form-select-sm"
                                        name="role"
                                        value={values.role}
                                        onChange={handleChanges}
                                        required
                                        style={{ fontSize: '0.85rem', fontWeight: '300', padding: '6px 10px' }}
                                    >
                                        <option value="">Select Role</option>
                                        <option value="admin">Admin</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="student">Student</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label" style={{ fontSize: '0.85rem', fontWeight: '400' }}>Email Address:</label>
                                    <input
                                        type="email"
                                        className="form-control form-control-sm"
                                        placeholder="Enter your email"
                                        name="email"
                                        value={values.email}
                                        onChange={handleChanges}
                                        required
                                        style={{ fontSize: '0.85rem', fontWeight: '300', padding: '6px 10px' }}
                                    />
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="password" className="form-label" style={{ fontSize: '0.85rem', fontWeight: '400' }}>Password:</label>
                                    <input
                                        type="password"
                                        className="form-control form-control-sm"
                                        placeholder="Enter your password"
                                        name="password"
                                        value={values.password}
                                        onChange={handleChanges}
                                        required
                                        style={{ fontSize: '0.85rem', fontWeight: '300', padding: '6px 10px' }}
                                    />
                                </div>

                                <div className="d-grid gap-2">
                                    <button
                                        type="submit"
                                        className="btn text-white py-2"
                                        style={{
                                            backgroundColor: "#4a48ac",
                                            fontSize: "0.9rem",
                                            fontWeight: "400",
                                            borderRadius: "6px"
                                        }}
                                    >
                                        Login
                                    </button>
                                </div>
                            </form>


                            {errorMessage && (
                                <div className="alert alert-danger mt-3" role="alert">
                                    {errorMessage}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login