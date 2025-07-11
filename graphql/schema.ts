import { buildSchema } from "graphql";

export const schema = buildSchema(`
  type Location {
    lat: Float
    lng: Float
  }

  type UserReview {
    pros: String
    cons: String
    rating: Float
    isRecommended: Boolean
    images: [String]
    updatedAt: String
  }

  input UserReviewInput {
    pros: String
    cons: String
    rating: Float
    isRecommended: Boolean
    images: [String]
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
    userReview: UserReview
  }

  type RestaurantPaginatedResult {
    data: [Restaurant]
    total: Int
    page: Int
    totalPages: Int
  }

  type Query {
    restaurants(
      page: Int = 1
      limit: Int = 10
      sortBy: String
      order: String
      search: String
    ): RestaurantPaginatedResult
  }

  type Mutation {
    deleteRestaurant(id: ID!): Boolean
    
    updateRestaurant(
      id: ID!
      name: String
      address: String
      rating: Float
      price_level: Int
      userReview: UserReviewInput
    ): Restaurant

    createRestaurant(
      name: String!
      address: String!
      rating: Float
      price_level: Int
      userReview: UserReviewInput
    ): Restaurant
  }
`);
