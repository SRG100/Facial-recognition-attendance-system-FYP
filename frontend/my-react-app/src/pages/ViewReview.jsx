import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarComponent from '../components/SideBar';
import { useLocation } from 'react-router-dom';
import '../assets/ViewReview.css';

const ViewReview = ({ userId, userRole }) => {

  const location = useLocation()

  const ReviewOf = location.state?.ReviewOf
  const Id = location.state?.Id

  const [reviewData, setReviewData] = useState({
    review: [],
    totalReviews: 0,
    avgRatings: "0",
    eachCount: []
  })

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (userId) {
      getReviewDetails()
    }

  }, [Id, ReviewOf, userId])

  const getReviewDetails = async () => {
    try {

      setLoading(true)
      const response = await axios.get(`http://localhost:3000/reviews/getReviewDetails?Id=${Id}&ReviewOf=${ReviewOf}`)
      console.log(response.data)
      setReviewData(response.data)
      setLoading(false)
    }
    catch (error) {

      console.error('Error while getting the reviews', error)
      setLoading(false)
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="d-inline-block">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star ${star <= rating ? 'text-warning' : 'text-secondary'}`}
          ></i>
        ))}
      </div>
    );
  };

  // Calculate percentage for progress bars
  const calculatePercentage = (count) => {
    return reviewData.totalReviews > 0 ? (count / reviewData.totalReviews) * 100 : 0;
  };

  // Find count for a specific rating
  const getCountForRating = (rating) => {
    const ratingData = reviewData.eachCount.find(item => item.Rating === rating);
    return ratingData ? ratingData.count : 0;
  };

  // Get color class based on rating
  const getRatingColorClass = (rating) => {
    if (rating >= 4) return "success";
    if (rating === 3) return "info";
    if (rating === 2) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <div>
        <SidebarComponent userRole={userRole} />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading review data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SidebarComponent userRole={userRole} />
    <div className='home-section'>
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            <div className="card shadow border-0 rounded-lg">
              <div className="card-header bg-primary text-white p-4">
                <h4 className="mb-0">{ReviewOf} Review Summary</h4>
                {reviewData.review.length > 0 && ReviewOf == "Module" && (
                  <h5 className="mb-0 mt-2">{reviewData.review[0].Module_Name}</h5>
                )}
                {reviewData.review.length > 0 && ReviewOf == "Student" && (
                  <h5 className="mb-0 mt-2">{reviewData.review[0].Student_Name}</h5>
                )}
                {reviewData.review.length > 0 && ReviewOf == "Teacher" && (
                  <h5 className="mb-0 mt-2">{reviewData.review[0].Teacher_Name}</h5>
                )}
              </div>

              <div className="card-body p-4">
                {reviewData.totalReviews === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-star-half-alt fa-4x text-muted mb-3"></i>
                    <h4>No Reviews Yet</h4>
                  </div>
                ) : (
                  <>
                    {/* Summary Section */}
                    <div className="row mb-5">
                      <div className="col-md-5">
                        <div className="card review border-0 bg-light shadow-sm h-100">
                          <div className="card-body text-center p-4">
                            <h2 className="display-3 fw-bold text-primary mb-0">
                              {parseFloat(reviewData.avgRatings).toFixed(1)}
                            </h2>
                            <div className="my-3">
                              {renderStars(Math.round(parseFloat(reviewData.avgRatings)))}
                            </div>
                            <p className="text-muted mb-3">Average Rating</p>
                            <div className="badge bg-primary p-2">
                              <i className="fas fa-user-friends me-1"></i> {reviewData.totalReviews} {reviewData.totalReviews === 1 ? 'Review' : 'Reviews'}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-7">
                        <div className="card review border-0 bg-light shadow-sm h-100">
                          <div className="card-body p-4">
                            <h5 className="card-title mb-4">Rating Distribution</h5>

                            {[5, 4, 3, 2, 1].map(rating => {
                              const count = getCountForRating(rating);
                              const percentage = calculatePercentage(count);
                              const colorClass = getRatingColorClass(rating);

                              return (
                                <div key={rating} className="mb-3">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="fw-bold">
                                      {rating} {rating === 1 ? 'Star' : 'Stars'}
                                    </div>
                                    <span className="text-muted">{count} {count === 1 ? 'review' : 'reviews'}</span>
                                  </div>
                                  <div className="progress" style={{ height: "10px" }}>
                                    <div
                                      className={`progress-bar bg-${colorClass}`}
                                      role="progressbar"
                                      style={{ width: `${percentage}%` }}
                                      aria-valuenow={percentage}
                                      aria-valuemin="0"
                                      aria-valuemax="100">
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review List */}
                    <div className="mb-4">
                      <h5 className="card-title mb-4">All Reviews</h5>
                      {reviewData.review.map((review) => (
                        <div key={review.Module_review_id} className="card review mb-3 border-0 shadow-sm">
                          <div className="card-body p-4">
                            <div className="d-flex flex-column flex-md-row justify-content-between mb-3">
                              <div>
                                <h6 style={{color:"blue"}}>Reviewed By:</h6>
                                {ReviewOf === "Student" ? (<>

                                  <h6 className="fw-bold mb-1">{review.Teacher_Name}</h6>
                                  <p className="text-muted small mb-0">{review.Teacher_Email}</p>
                                </>) : ReviewOf === "Teacher" ? (<>
                                  <h6 className="fw-bold mb-1">{review.student_name}</h6>
                                  <p className="text-muted small mb-0">{review.student_email}</p>
                                </>
                                ) : (
                                  <>
                                    <h6 className="fw-bold mb-1">{review.Student_Name}</h6>
                                    <p className="text-muted small mb-0">{review.Student_Email}</p>
                                  </>
                                )}

                              </div>
                              <div className="mt-2 mt-md-0">
                                {renderStars(review.Rating)}
                              </div>
                            </div>
                            <hr className="my-3" />
                            {review.Suggestions ? (
                              <div>
                                <h6 className="fw-bold text-muted mb-2">Feedback:</h6>
                                <p className="mb-0">{review.Suggestions}</p>
                              </div>
                            ) : (
                              <p className="text-muted fst-italic mb-0">No additional feedback provided</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ViewReview;