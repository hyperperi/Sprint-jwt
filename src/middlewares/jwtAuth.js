import { expressjwt } from "express-jwt";
import reviewRepository from "../repositories/reviewRepository.js";

async function verifyReviewAuth(req, res, next) {
  const { id: reviewId } = req.params;
  // const { userId } = req.user;
  const { id: userId } = req.user;
  try {
    const review = await reviewRepository.getById(reviewId);

    if (!review) {
      const error = new Error("Review not found");
      error.code = 404;
      throw error;
    }

    if (review.authorId !== userId) {
      const error = new Error("Forbidden");
      error.code = 403;
      throw error;
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export default {
  // verifyAccessToken,
  // verifyRefreshToken,
  verifyReviewAuth,
};
