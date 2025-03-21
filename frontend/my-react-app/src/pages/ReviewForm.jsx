import React from 'react'
import axios from 'axios'
import SidebarComponent from '../components/SideBar'
import { useLocation } from 'react-router-dom'
import "../assets/Rating.css"
import { useEffect, useState } from 'react'

function ReviewForm({ userId, userRole }) {
  const location = useLocation()
  const ReviewOf = location.state?.ReviewOf
  const Id =location.state?.ReviewOf
  const [values, setValues] = useState({
    suggestions: '',
    rating: ''
  })
  
  const handleChanges = (e) => {
    const { name, value } = e.target
    setValues({
      ...values,
      [name]: value,
    })

  }
  const reviewData = {
    ...values,
    Id:Id,
    userId:userId,
  }

  const handleSubmitTeacherReview = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:3000/reviews/studentReview', reviewData)
      console.log(response.message)

    } catch (err) {
      console.log(err)
    }

  }
  const handleSubmitStudentReview = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:3000/reviews/studentReview', reviewData)
      console.log(response.message)

    } catch (err) {
      console.log(err)
    }

  }
  const handleSubmitModuleReview = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:3000/reviews/moduleReview', reviewData)
      console.log(response.message)

    } catch (err) {
      console.log(err)
    }

  }
  return (
    <div>
      <SidebarComponent userRole={userRole} />
      <div className="container-fluid px-1 py-5 mx-auto">
        <div className="row d-flex justify-content-center">
          <div className="col-xl-7 col-lg-8 col-md-9 col-11 text-center">
            <div className="card">
              <h5 className="text-center mb-4">Review {ReviewOf}</h5>
              <form className="form-card" >
                <div className="row justify-content-between text-left">

                  <div className="form-group  flex-column d-flex">
                    <label className="form-control-label text-center">{ReviewOf} Ratings<span className="text-danger"> *</span></label>
                    <div class="star-rating text-center">
                      <input type="radio" id="star5" name="rating" value="5" onChange={handleChanges} />
                      <label for="star5" class="fas fa-star"></label>
                      <input type="radio" id="star4" name="rating" value="4" onChange={handleChanges} />
                      <label for="star4" class="fas fa-star"></label>
                      <input type="radio" id="star3" name="rating" value="3" onChange={handleChanges} />
                      <label for="star3" class="fas fa-star"></label>
                      <input type="radio" id="star2" name="rating" value="2" onChange={handleChanges} />
                      <label for="star2" class="fas fa-star"></label>
                      <input type="radio" id="star1" name="rating" value="1" onChange={handleChanges} />
                      <label for="star1" class="fas fa-star"></label>
                    </div>
                  </div>
                  <div className="row justify-content-between text-center">
                    <div className="form-group align-middle text">
                      <label className="form-control-label px-3">Suggesions for {ReviewOf}</label>
                      <textarea type="text" name="Suggestions" className='form-control mx-auto' onChange={handleChanges} style={{ width: "50%" }} placeholder="Suggestions" />

                    </div>

                  </div>
                  <div className="row justify-content-end">
                    {ReviewOf == "Student" ? (
                      <div className="form-group col-sm-6"> <button type="submit" className="btn btn-outline-primary" onClick={handleSubmitStudentReview} >Review {ReviewOf} </button> </div>
                    ) : ReviewOf == "Teacher" ? (
                      <div className="form-group col-sm-6"> <button type="submit" className="btn btn-outline-primary" onClick={handleSubmitTeacherReview}>Review {ReviewOf} </button> </div>
                    ) : (
                      <div className="form-group col-sm-6"> <button type="submit" className="btn btn-outline-primary" onClick={handleSubmitModuleReview}>Review {ReviewOf} </button> </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewForm