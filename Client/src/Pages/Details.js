import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import Button from '../Components/Button';
import toast from 'react-hot-toast';
import '../Styles/Details.css';
import '../Styles/Home.css';

export default function Details() {
  const { id } = useParams();
  const {
    fetchProductDetails,
    fetchReviews,
    addReview,
    fetchComments,
    addComment,
    loginStatus,
  } = useContext(PetContext);
  const [item, setItem] = useState({});
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, review: '' });
  const [commentText, setCommentText] = useState(''); // To handle comment text input
  const [comments, setComments] = useState({}); // Store comments for each review

  useEffect(() => {
    const fetchData = async () => {
      try {
        const product = await fetchProductDetails(id);
        setItem(product);

        const fetchedReviews = await fetchReviews(id);
        setReviews(fetchedReviews || []);

        // Fetch comments for each review
        const fetchedComments = {};
        for (const review of fetchedReviews) {
          const reviewComments = await fetchComments(id, review._id);
          fetchedComments[review._id] = reviewComments || [];
        }
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error fetching product details or reviews:', error);
      }
    };

    fetchData();
  }, [id, fetchProductDetails, fetchReviews, fetchComments]);

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const submitReview = async () => {
    if (!loginStatus) {
      toast.error('Sign in to your account to add a review');
      return;
    }
    if (!newReview.review.trim()) {
      toast.error('Review cannot be empty');
      return;
    }

    const userID = localStorage.getItem('userID'); // Retrieve userID from localStorage
    if (!userID) {
      toast.error('User ID not found. Please sign in again.');
      return;
    }

    try {
      const updatedReviews = await addReview(id, { ...newReview, userID });
      if (updatedReviews) {
        setReviews(updatedReviews); // Update the reviews list
        setNewReview({ rating: 5, review: '' }); // Reset the review form
      }
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const submitComment = async (reviewId) => {
    if (!loginStatus) {
      toast.error('Sign in to your account to add a comment');
      return;
    }
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    const userID = localStorage.getItem('userID');
    if (!userID) {
      toast.error('User ID not found. Please sign in again.');
      return;
    }

    try {
      const updatedComments = await addComment(id, reviewId, { userID, text: commentText });
      setComments((prev) => ({ ...prev, [reviewId]: updatedComments })); // Update comments for the specific review
      setCommentText(''); // Reset comment input
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <>
      <div className="details d-flex flex-column flex-md-row align-items-center pb-3">
        <div className="w-100 w-md-50 d-flex justify-content-center align-items-center">
          <img src={item.image} alt={item.title} />
        </div>
        <div className="d-flex flex-column w-100 w-md-50 text-black me-5 ms-5">
          <h1 className="fw-bold mb-3">{item.title}</h1>
          <h4 className="fw-bold mb-3">₹{item.price}</h4>
          <hr />
          <p className="mt-3 text-muted mb-4">{item.description}</p>

          {/* Reviews Section */}
          <div className="mt-4">
            <h5 className="mb-3">Reviews</h5>
            {reviews?.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="mb-3">
                  <strong>{review.user?.name || 'Anonymous'}</strong>
                  <p>Rating: {review.rating}/5</p>
                  <p><i>{review.review}</i></p>

                  {/* Comments Section */}
                  <div className="mt-3">
                    <h6 style={{color:'blue'}}>Comments:</h6>
                    {comments[review._id]?.length > 0 ? (
                      comments[review._id].map((comment) => (
                        <div key={comment._id} className="mb-2">
                          <strong>{comment.user?.name || 'Anonymous: '} :</strong>
                          <span><i> {comment.text} </i></span>
                        </div>
                      ))
                    ) : (
                      <p>No comments yet. Be the first to comment!</p>
                    )}
                    <textarea
                      placeholder="Write a comment..."
                      className="form-control mb-2"
                      rows="2"
                      value={commentText}
                      onChange={handleCommentChange}
                    />
                    <Button
                      onClick={() => submitComment(review._id)}
                      color="dark"
                      rounded
                    >
                      Submit Comment
                    </Button>
                  </div>
                  <hr />
                </div>
              ))
            ) : (
              <p>No reviews yet. Be the first to review this product!</p>
            )}
          </div>

          {/* Add Review Form */}
          <div className="mt-4">
            <h5>Add a Review</h5>
            <div className="d-flex flex-column gap-3">
              <select
                name="rating"
                value={newReview.rating}
                onChange={handleReviewChange}
                className="form-control"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
              <textarea
                name="review"
                value={newReview.review}
                onChange={handleReviewChange}
                placeholder="Write your review here..."
                className="form-control"
                rows="3"
              />
              <Button onClick={submitReview} color="dark" rounded>
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
