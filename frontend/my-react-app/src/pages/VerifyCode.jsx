import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import SidebarComponent from '../components/SideBar'

const VerifyCode = ({ userId,userRole }) => {
    // const [loading, setLoading] = useState(true)
    // const [code,setCode]=useState(null)
    const navigate = useNavigate()

    const location = useLocation()

    const Class_Id = location.state?.Class_Id
    const Attendance_id = location.state?.Attendance_id

    console.log("The class id git from join class is:", Class_Id)
    const [code, setCode] = useState({
        classCode: ''
    })
    const handleChanges = (e) => {
        const { name, value } = e.target
        setCode({
            ...code,
            [name]: value,
        })
    }

    const verifyClassCode = async (e) => {
        e.preventDefault()
        try {
            const studentClassCode = code.classCode
            const response = await axios.get(`http://localhost:3000/verification/codeVerification?Class_Id=${Class_Id}&studentClassCode=${studentClassCode}&Attendance_id=${Attendance_id}`)
            const verified = response.data?.codeVerified
            console.log(verified)
            if (verified) {

                alert("The code is correct and verified sucessfully")
                navigate("/checkface", { state: { Class_Id, Attendance_id } })

            }
            else {
                alert("The code is not correct please try again")

            }

        } catch (err) {
            console.log("Error while verifying class:", err)
        }
    }

    return (
        <div>
            <SidebarComponent userRole={userRole}/>
            Code Verification <br />
            Now, code verification step

            <div>
                <form onSubmit={verifyClassCode}>
                    <div>
                        <label htmlFor='email'>Enter Class Code </label>
                        <input type='text' placeholder="Class Code" onChange={handleChanges}
                            name="classCode" />
                    </div>
                    <button > Submit</button>
                </form>
            </div>
        </div>

    )
}

export default VerifyCode