import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import SidebarComponent from '../components/SideBar'
import PageNotFound from '../components/PageNotFound'
import Header from '../components/Header'
import ComponentCard from '../components/ComponentCard'

const VerifyCode = ({ userId, userRole, userName }) => {
    const navigate = useNavigate()
    const location = useLocation()

    const Class_Id = location.state?.Class_Id
    const Attendance_id = location.state?.Attendance_id
    const fromNavigate = location.state?.fromNavigate
    if (!fromNavigate) {
        return <PageNotFound />
    }

    const [code, setCode] = useState({ classCode: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [countdown, setCountdown] = useState(null)

    const handleChanges = (e) => {
        const { name, value } = e.target
        setCode({ ...code, [name]: value })
        if (error) setError('')
    }

    const verifyClassCode = async (e) => {
        e.preventDefault()
        if (!code.classCode.trim()) {
            setError('Please enter the code provided by your teacher')
            return
        }

        setLoading(true)
        setError('')

        try {
            const studentClassCode = code.classCode
            const response = await axios.get(`http://localhost:3000/verification/codeVerification?Class_Id=${Class_Id}&studentClassCode=${studentClassCode}&Attendance_id=${Attendance_id}`)
            const verified = response.data?.codeVerified

            if (verified) {
                setLoading(false)
                let seconds = 3
                setCountdown(seconds)

                const timer = setInterval(() => {
                    seconds -= 1
                    setCountdown(seconds)

                    if (seconds <= 0) {
                        clearInterval(timer)
                        navigate("/checkface", { state: { Class_Id, Attendance_id, fromNavigate: true } })
                    }
                }, 1000)
            } else {
                setLoading(false)
                setError('Incorrect code. Please check and try again.')
            }
        } catch (err) {
            setLoading(false)
            setError('An error occurred. Please try again later.')
            console.error("Error while verifying class:", err)
        }
    }


    return (
        <div className="d-flex min-vh-100 bg-light">
            <SidebarComponent userRole={userRole} />
            <div className='home-section'>
                <Header userName={userName} userRole={userRole} />
                <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                    <div className="max-w mx-auto  px-4 sm:px-6 lg:px-8"></div>
                    <ComponentCard title="Attendance Verification" description="Verify your attendance using the code provided by your teacher.">

                        <div className="flex items-center justify-center w-full">
                            <div className="w-full md:w-1/2 lg:w-2/ p-8 bg-white ">
                                <h2 className="text-center text-blue-600 font-bold text-xl mb-4">Code Verification</h2>

                                {countdown !== null ? (
                                    <div className="text-center py-4">
                                        <div className="text-green-600 text-xl font-medium mb-3">✓ Code verified successfully!</div>
                                        <div className="text-lg">
                                            Redirecting to face verification in {countdown} second{countdown !== 1 ? 's' : ''}...
                                        </div>
                                        <div className="mt-3 text-gray-500">
                                            Please prepare your camera for the next step.
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-center text-gray-600 mb-4">
                                            <p>Please enter the verification code provided by your teacher.</p>
                                            <small className="text-gray-500">This is required to confirm your attendance.</small>
                                        </div>

                                        <form onSubmit={verifyClassCode}>
                                            <div className="mb-3">
                                                
                                                <input
                                                    id="classCode"
                                                    type="text"
                                                    name="classCode"
                                                    value={code.classCode}
                                                    onChange={handleChanges}
                                                    placeholder="Enter Class code"
                                                    className={`form-control text-center text-lg w-full p-2 border rounded ${error ? 'border-red-500' : 'border-gray-300'}`}
                                                    autoComplete="off"
                                                    autoFocus
                                                />
                                                {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className={`w-full py-2 bg-blue-600 text-white font-medium rounded ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                                            >
                                                {loading ? 'Verifying...' : 'Verify Code'}
                                            </button>
                                        </form>

                                        <div className="text-center text-gray-500 mt-4 text-sm">
                                            Having trouble? Please ask your teacher for assistance.
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </ComponentCard>
                </div>
            </div>
        </div>

    )
}

export default VerifyCode
