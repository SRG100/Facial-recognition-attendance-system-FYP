import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import SidebarComponent from '../components/SideBar'
import PageNotFound from '../components/PageNotFound'

const VerifyCode = ({ userId, userRole }) => {
    const navigate = useNavigate()
    const location = useLocation()

    const Class_Id = location.state?.Class_Id
    const Attendance_id = location.state?.Attendance_id
    const fromNavigate = location.state?.fromNavigate

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
                        navigate("/checkface", { state: { Class_Id, Attendance_id ,fromNavigate:true} })
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
    if (!fromNavigate){
        return <PageNotFound/>
    }

    return (
        <div className="d-flex min-vh-100 bg-light">
            <SidebarComponent userRole={userRole} />

            <div className="container d-flex align-items-center justify-content-center">
                <div className="col-md-6 col-lg-5 shadow p-5 bg-white rounded-4">
                    <h2 className="text-center text-primary mb-4">Attendance Verification</h2>

                    {countdown !== null ? (
                        <div className="text-center py-4">
                            <div className="text-success fs-4 mb-3">✓ Code verified successfully!</div>
                            <div className="fs-5">
                                Redirecting to face verification in {countdown} second{countdown !== 1 ? 's' : ''}...
                            </div>
                            <div className="mt-3 text-muted">
                                Please prepare your camera for the next step.
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="text-center text-secondary mb-4">
                                <p>Please enter the verification code provided by your teacher.</p>
                                <small className="text-muted">This is required to confirm your attendance.</small>
                            </div>

                            <form onSubmit={verifyClassCode}>
                                <div className="mb-3">
                                    <label htmlFor="classCode" className="form-label fw-medium">
                                        Class Code
                                    </label>
                                    <input
                                        id="classCode"
                                        type="text"
                                        name="classCode"
                                        value={code.classCode}
                                        onChange={handleChanges}
                                        placeholder="Enter 6-digit code"
                                        className={`form-control text-center fs-5 ${error ? 'is-invalid' : ''}`}
                                        autoComplete="off"
                                        autoFocus
                                    />
                                    {error && <div className="invalid-feedback">{error}</div>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`btn w-100 btn-primary ${loading ? 'disabled' : ''}`}
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </button>
                            </form>

                            <div className="text-center text-muted mt-4 small">
                                Having trouble? Please ask your teacher for assistance.
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VerifyCode
