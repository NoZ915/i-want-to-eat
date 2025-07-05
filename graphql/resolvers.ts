import Restaurant from "../models/restaurantModel";
import mongoose from "mongoose";

export const resolvers = {
  restaurants: async ({ page = 1, limit = 10 }: { page: number; limit: number }) => {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Restaurant.find().skip(skip).limit(limit),
      Restaurant.countDocuments(),
    ]);
    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  deleteRestaurant: async ({ id }: { id: string }) => {
    try {
      const result = await Restaurant.findByIdAndDelete(id);
      return !!result;
    } catch (err) {
      console.error("刪除餐廳失敗", err);
      return false;
    }
  },

  updateUserAddedRestaurant: async ({
    id,
    name,
    address,
    isRecommended,
    rating,
    price_level,
  }: {
    id: string;
    name?: string;
    address?: string;
    isRecommended?: boolean;
    rating?: number;
    price_level?: number;
  }) => {
    try {
      // 只能更新使用者自行新增的餐廳 (isUserAdded: true)
      const restaurant = await Restaurant.findOne({ _id: id, isUserAdded: true });
      if (!restaurant) throw new Error("找不到使用者新增的餐廳");

      const updateFields: any = {};
      if (name !== undefined) updateFields.name = name;
      if (address !== undefined) updateFields.address = address;
      if (isRecommended !== undefined) updateFields.isRecommended = isRecommended;
      if (rating !== undefined) updateFields.rating = rating;
      if (price_level !== undefined) updateFields.price_level = price_level;

      Object.assign(restaurant, updateFields);
      await restaurant.save();

      return restaurant;
    } catch (error) {
      console.error("更新使用者餐廳失敗", error);
      throw error;
    }
  },

  updateGoogleRestaurantUserReview: async ({
    id,
    pros,
    cons,
    rating,
    isRecommended,
    images,
  }: {
    id: string;
    pros?: string;
    cons?: string;
    rating?: number;
    isRecommended?: boolean;
    images?: string[];
  }) => {
    try {
      // 只能更新 Google 取得的餐廳 (isUserAdded: false)
      const restaurant = await Restaurant.findOne({ _id: id, isUserAdded: false });
      if (!restaurant) throw new Error("找不到 Google 取得的餐廳");

      // 假設 userReviews 只有一筆共用，沒有就新增
      let review = restaurant.userReviews?.[0];
      if (!review) {
        review = restaurant.userReviews.create({
          userId: "", // 目前共用可放 null 或預設值
          pros: "",
          cons: "",
          rating: 0,
          isRecommended: false,
          images: [],
          updatedAt: new Date(),
        })
      }

      if (pros !== undefined) review.pros = pros;
      if (cons !== undefined) review.cons = cons;
      if (rating !== undefined) review.rating = rating;
      if (isRecommended !== undefined) review.isRecommended = isRecommended;
      if (images !== undefined) review.images = images;
      review.updatedAt = new Date();

      await restaurant.save();

      return restaurant;
    } catch (error) {
      console.error("更新 Google 餐廳評論失敗", error);
      throw error;
    }
  },

  addUserAddedRestaurant: async ({
    name,
    address,
    location,
    rating,
    price_level,
    isRecommended,
  }: {
    name: string;
    address: string;
    location: { lat: number; lng: number };
    rating?: number;
    price_level?: number;
    isRecommended?: boolean;
  }) => {
    try {
      const newRestaurant = new Restaurant({
        place_id: new mongoose.Types.ObjectId().toHexString(), // 自行產生唯一id，因為是使用者新增
        name,
        address,
        location,
        distance: 0, // 可視需求計算或預設
        rating: rating || 0,
        user_ratings_total: 0, // 使用者新增初始為0
        types: [],
        price_level: price_level || 0,
        isUserAdded: true, // 標示為使用者新增
        isRecommended: isRecommended || false,
        createdAt: new Date(),
        userReviews: [], // 使用者新增先空
      });

      await newRestaurant.save();

      return newRestaurant;
    } catch (error) {
      console.error("新增使用者餐廳失敗", error);
      throw error;
    }
  },
};