import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import axios from 'axios'
import toast from 'react-hot-toast'
import AttendanceImage from '../assets/Attendance.png'
import fras from "../assets/Fras.png"
import Button from '../Ui/Button'
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
                localStorage.setItem("redirectAfterReload", response.data.redirect) 
                if (response.data.success) {
                    toast.success(response.data.message)
                } else {
                    localStorage.setItem("fromNavigate","true") 

                    toast(response.data.message, { icon: '👏' })
                    console.log(response.data.redirect)

                }
                setTimeout(() => window.location.reload(), 500)
                console.log('The navigation is ',response.data.redirect)
                navigate(response.data.redirect, { state: { fromNavigate: true } })

            } else {
                toast.error(response.data.message)
            }
        } catch (err) {
            console.log(err)
            toast.error(err.response?.data?.message || "Login failed")
        }
    }

    return (
        <>
                <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
                    <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
                        <div className="flex flex-col flex-1">
                            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                                <div>
                                    <div className="mb-5 sm:mb-8">
                                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                                            Sign In
                                        </h1>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Enter your email and password to sign in!
                                        </p>
                                    </div>
                                    <div>
                                        <form onSubmit={handleSubmit}>
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                                        Role <span className="text-error-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <select
                                                            name="role"
                                                            value={values.role}
                                                            onChange={handleChanges}
                                                            required
                                                            className=" h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                                                        >
                                                            <option value="">Choose your role</option>
                                                            <option value="admin">Admin</option>
                                                            <option value="teacher">Teacher</option>
                                                            <option value="student">Student</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">

                                                        Email <span className="text-error-500">*</span>
                                                    </label>
                                                    <div>
                                                        <input
                                                        type="email"
                                                        name="email"
                                                        placeholder='eg.you@gmail.com'
                                                        value={values.email}
                                                        onChange={handleChanges}
                                                        required
                                                        className=" h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">

                                                        Password <span className="text-error-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <div>
                                                            <input
                                                                type="password"
                                                                name="password"
                                                                value={values.password}
                                                                onChange={handleChanges}
                                                                required
                                                                placeholder="Enter your password"
                                                                className=" h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between"></div>
                                                <div>
                                                    <Button className="w-full" size="sm"  type="submit">
                                                        Sign in
                                                    </Button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
                            <div className="relative flex items-center justify-center z-1">
                                <div className="flex flex-col items-center max-w-xs">
                                    <Link to="/" className="block mb-4">
                                        <img
                                            src={fras}
                                            className='align-middle'
                                            alt="Logo"
                                        />
                                    </Link>
                                    <p className="text-center text-gray-400 dark:text-white/60">
                                        Attendnace Management System
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

        </>

    )
}

export default Login