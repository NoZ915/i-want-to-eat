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

  type Mutation {
    deleteRestaurant(id: ID!): Boolean,

    # 更新使用者自行新增餐廳的主要欄位
    updateUserAddedRestaurant(
      id: ID!
      name: String
      address: String
      isRecommended: Boolean
      rating: Float
      price_level: Int
    ): Restaurant

    # 只更新 Google 取得餐廳的 userReview，假設只有一筆共用的 userReview
    updateGoogleRestaurantUserReview(
      id: ID!
      pros: String
      cons: String
      rating: Float
      isRecommended: Boolean
      images: [String]
    ): Restaurant

    addUserAddedRestaurant(
      name: String!
      address: String!
      location: LocationInput!
      rating: Float
      price_level: Int
      isRecommended: Boolean
    ): Restaurant
  }
`);