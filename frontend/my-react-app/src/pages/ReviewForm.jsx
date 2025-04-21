import React from 'react'
import axios from 'axios'
import SidebarComponent from '../components/SideBar'
import { useLocation } from 'react-router-dom'
import "../assets/Rating.css"
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import PageNotFound from '../components/PageNotFound'
import Header from '../components/Header'
import Breadcrumb from '../components/Breadcrumb'
import ComponentCard from '../components/ComponentCard'

function ReviewForm({ userId, userRole, userName }) {
  const location = useLocation()
  const ReviewOf = location.state?.ReviewOf
  const Id = location.state?.Id
  const fromNavigate = location.state?.fromNavigate
  const [values, setValues] = useState({
    suggestions: '',
    rating: ''
  })
  if (!fromNavigate) {
    return <PageNotFound />
  }

  const handleChanges = (e) => {
    const { name, value } = e.target
    setValues({
      ...values,
      [name]: value,
    })
  }

  const reviewData = {
    ...values,
    Id: Id,
    userId: userId,
  }

  const resetForm = () => {
    setValues({
      suggestions: '',
      rating: ''
    })

    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.checked = false
    })
  }

  const validateForm = () => {
    if (!values.rating) {
      toast.error('Please select a rating before submitting')
      return false
    }
    return true
  }

  const handleSubmitTeacherReview = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const response = await axios.post('http://localhost:3000/reviews/teacherReview', reviewData)
      console.log(response.message)
      if(response.data.verified) {
        toast.success(response.data.message)

      }
      else{
        toast.error(response.data.message)
      }
      resetForm()
    } catch (err) {
      console.log(err)
      toast.error(response?.data?.message || 'An error occurred')
    }
  }

  const handleSubmitStudentReview = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const response = await axios.post('http://localhost:3000/reviews/studentReview', reviewData)
      console.log(response.message)
      toast.success(response.data.message)
      resetForm() 
    } catch (err) {
      console.log(err)
      toast.error(err.response?.data?.message || 'An error occurred')
    }
  }

  const handleSubmitModuleReview = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const response = await axios.post('http://localhost:3000/reviews/moduleReview', reviewData)
      console.log(response.message)
      toast.success(response.data.message)
      resetForm() 
    } catch (err) {
      console.log(err)
      toast.error(err.response?.data?.message || 'An error occurred')
    }
  }

  return (
    <div>
      <SidebarComponent userRole={userRole} />
      <div className='home-section'>
        <Header userRole={userRole} userName={userName} />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Breadcrumb pageTitle="Review Form" Title={ReviewOf} />
          <div className="max-w mx-auto  px-4 sm:px-6 lg:px-8">
            <div className="container-fluid px-1 py-5 mx-auto ">
              <div className="row d-flex justify-content-center">
                <ComponentCard title={`Review ${ReviewOf}`} className="mt-6" >
                  <form className="w-full">
                    <div className="flex flex-col items-center text-center w-full">
                      <div className="w-full mb-6">
                        <label className="block text-center mb-2">{ReviewOf} Ratings<span className="text-red-500"> *</span></label>
                        <div className="star-rating text-center">
                          <input type="radio" id="star5" name="rating" value="5" onChange={handleChanges} />
                          <label htmlFor="star5" className="fas fa-star"></label>
                          <input type="radio" id="star4" name="rating" value="4" onChange={handleChanges} />
                          <label htmlFor="star4" className="fas fa-star"></label>
                          <input type="radio" id="star3" name="rating" value="3" onChange={handleChanges} />
                          <label htmlFor="star3" className="fas fa-star"></label>
                          <input type="radio" id="star2" name="rating" value="2" onChange={handleChanges} />
                          <label htmlFor="star2" className="fas fa-star"></label>
                          <input type="radio" id="star1" name="rating" value="1" onChange={handleChanges} />
                          <label htmlFor="star1" className="fas fa-star"></label>
                        </div>
                      </div>

                      <div className="w-100 mb-6">
                        <label className="block text-center mb-2 px-3">Comments for {ReviewOf}</label>
                        <div className="flex justify-center">
                          <textarea
                            type="text"
                            name="suggestions"
                            className="w-3/5 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={handleChanges}
                            value={values.suggestions}
                            placeholder="Comments"
                          />
                        </div>
                      </div>
                      <div className="w-full flex justify-center mt-4">
                        {ReviewOf === "Student" ? (
                          <button
                            type="submit"
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition duration-200"
                            onClick={handleSubmitStudentReview}
                          >
                            Review {ReviewOf}
                          </button>
                        ) : ReviewOf === "Teacher" ? (
                          <button
                            type="submit"
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition duration-200"
                            onClick={handleSubmitTeacherReview}
                          >
                            Review {ReviewOf}
                          </button>
                        ) : (
                          <button
                            type="submit"
                            className="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition duration-200"
                            onClick={handleSubmitModuleReview}
                          >
                            Review {ReviewOf}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>

                </ComponentCard>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default ReviewForm