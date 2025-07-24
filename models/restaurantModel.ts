import mongoose from "mongoose";

const userReviewSchema = new mongoose.Schema({
  pros: String,
  cons: String,
  rating: Number,
  isRecommended: Boolean,
  images: [String],
  updatedAt: { type: Date, default: Date.now }
});

const restaurantSchema = new mongoose.Schema({
  placeId: String,
  name: String,
  address: String,
  location: {
    lat: Number,
    lng: Number,
  },
  distance: Number,
  rating: Number,
  userRatingsTotal: Number,
  types: [String],
  priceLevel: Number,

  userReview: userReviewSchema,

  isUserAdded: Boolean,
  createdAt: { type: Date, default: Date.now },
});



export default mongoose.model("Restaurant", restaurantSchema);
