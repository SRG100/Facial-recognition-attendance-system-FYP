import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarComponent from '../components/SideBar';
import { useLocation } from 'react-router-dom';
import PageNotFound from '../components/PageNotFound';

const ViewReview = ({ userId, userRole }) => {
  const location = useLocation();

  const ReviewOf = location.state?.ReviewOf;
  const Id = location.state?.Id;
  const fromNavigate = location.state?.fromNavigate;

  const [reviewData, setReviewData] = useState({
    review: [],
    totalReviews: 0,
    avgRatings: "0",
    eachCount: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      getReviewDetails();
    }
  }, [Id, ReviewOf, userId]);

  const getReviewDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/reviews/getReviewDetails?Id=${Id}&ReviewOf=${ReviewOf}`);
      setReviewData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error while getting the reviews', error);
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="inline-flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg 
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
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
    if (rating >= 4) return "bg-green-500";
    if (rating === 3) return "bg-blue-500";
    if (rating === 2) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div>
        <SidebarComponent userRole={userRole} />
        <div className="container py-12 text-center">
          <div className="inline-block animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-3 text-gray-600">Loading review data...</p>
        </div>
      </div>
    );
  }

  if (userRole === "student") {
    return <PageNotFound />;
  }

  if (!fromNavigate) {
    return <PageNotFound />;
  }

  return (
    <div className="flex">
      <SidebarComponent userRole={userRole} />
      <div className="flex-1 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Header */}
              <div className="bg-blue-600 px-6 py-4 text-white">
                <h2 className="text-2xl font-bold">{ReviewOf} Review Summary</h2>
                {reviewData.review.length > 0 && ReviewOf === "Module" && (
                  <h3 className="text-xl mt-1 font-medium">{reviewData.review[0].Module_Name}</h3>
                )}
                {reviewData.review.length > 0 && ReviewOf === "Student" && (
                  <h3 className="text-xl mt-1 font-medium">{reviewData.review[0].Student_Name}</h3>
                )}
                {reviewData.review.length > 0 && ReviewOf === "Teacher" && (
                  <h3 className="text-xl mt-1 font-medium">{reviewData.review[0].Teacher_Name}</h3>
                )}
              </div>

              <div className="p-6">
                {reviewData.totalReviews === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 15.585l7.066 4.3a1 1 0 001.479-1.03l-1.84-8.02L22.97 5.33a1 1 0 00-.555-1.695l-8.323-.648L10.598.415a1 1 0 00-1.795 0L5.582 2.987l-8.323.648a1 1 0 00-.555 1.695l6.084 5.505-1.84 8.02a1 1 0 001.479 1.03L10 15.585z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700">No Reviews Yet</h3>
                  </div>
                ) : (
                  <>
                    {/* Summary Section */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                      <div className="md:col-span-5">
                        <div className="bg-gray-50 rounded-lg shadow-sm p-6 h-full">
                          <div className="text-center">
                            <h2 className="text-5xl font-bold text-blue-600">
                              {parseFloat(reviewData.avgRatings).toFixed(1)}
                            </h2>
                            <div className="my-3">
                              {renderStars(Math.round(parseFloat(reviewData.avgRatings)))}
                            </div>
                            <p className="text-gray-500 mb-3">Average Rating</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                              </svg>
                              {reviewData.totalReviews} {reviewData.totalReviews === 1 ? 'Review' : 'Reviews'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-7">
                        <div className="bg-gray-50 rounded-lg shadow-sm p-6 h-full">
                          <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>

                          {[5, 4, 3, 2, 1].map(rating => {
                            const count = getCountForRating(rating);
                            const percentage = calculatePercentage(count);
                            const colorClass = getRatingColorClass(rating);

                            return (
                              <div key={rating} className="mb-3">
                                <div className="flex justify-between items-center mb-1">
                                  <div className="font-medium">
                                    {rating} {rating === 1 ? 'Star' : 'Stars'}
                                  </div>
                                  <span className="text-gray-500 text-sm">{count} {count === 1 ? 'review' : 'reviews'}</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${colorClass}`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Review List */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">All Reviews</h3>
                      <div className="space-y-4">
                        {reviewData.review.map((review) => (
                          <div key={review.Module_review_id} className="bg-gray-50 rounded-lg shadow-sm p-6">
                            <div className="flex flex-col md:flex-row justify-between mb-4">
                              <div>
                                <h4 className="text-blue-600 font-medium">Reviewed By:</h4>
                                {ReviewOf === "Student" ? (
                                  <>
                                    <h5 className="font-bold text-gray-800">{review.Teacher_Name}</h5>
                                    <p className="text-sm text-gray-500">{review.Teacher_Email}</p>
                                  </>
                                ) : ReviewOf === "Teacher" ? (
                                  <>
                                    <h5 className="font-bold text-gray-800">{review.student_name}</h5>
                                    <p className="text-sm text-gray-500">{review.student_email}</p>
                                  </>
                                ) : (
                                  <>
                                    <h5 className="font-bold text-gray-800">{review.Student_Name}</h5>
                                    <p className="text-sm text-gray-500">{review.Student_Email}</p>
                                  </>
                                )}
                              </div>
                              <div className="mt-2 md:mt-0">
                                {renderStars(review.Rating)}
                              </div>
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                              {review.Suggestions ? (
                                <div>
                                  <h5 className="font-semibold text-gray-600 mb-2">Feedback:</h5>
                                  <p className="text-gray-700">{review.Suggestions}</p>
                                </div>
                              ) : (
                                <p className="text-gray-500 italic">No additional feedback provided</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReview