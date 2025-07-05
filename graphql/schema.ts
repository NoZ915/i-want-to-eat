import { buildSchema } from "graphql";

export const schema = buildSchema(`
  type Location {
    lat: Float
    lng: Float
  }

  type UserReview {
    userId: ID!
    pros: String
    cons: String
    rating: Float
    isRecommended: Boolean
    images: [String]
    updatedAt: String
  }

  type Restaurant {
    _id: ID!
    place_id: String
    name: String
    address: String
    location: Location
    distance: Int
    rating: Float
    user_ratings_total: Int
    types: [String]
    price_level: Int
    isUserAdded: Boolean
    createdAt: String
    userReviews: [UserReview]
  }

  type RestaurantPaginatedResult {
    data: [Restaurant]
    total: Int
    page: Int
    totalPages: Int
  }

  type Query {
    restaurants(page: Int = 1, limit: Int = 10): RestaurantPaginatedResult
  }
`);