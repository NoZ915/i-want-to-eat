import mongoose from "mongoose";

const userReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  pros: String,
  cons: String,
  rating: Number,
  isRecommended: Boolean,
  images: [String],
  updatedAt: { type: Date, default: Date.now }
});

const restaurantSchema = new mongoose.Schema({
  place_id: { type: String, unique: true },
  name: String,
  address: String,
  location: {
    lat: Number,
    lng: Number,
  },
  distance: Number,
  rating: Number,
  user_ratings_total: Number,
  types: [String],
  price_level: Number,

  userReviews: [userReviewSchema],

  isUserAdded: Boolean,
  createdAt: { type: Date, default: Date.now },
});



export default mongoose.model("Restaurant", restaurantSchema);