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
    rating,
    price_level,
    userReview,  // 新增 userReview 參數，型態可定義為 Partial<UserReview>
  }: {
    id: string;
    name?: string;
    address?: string;
    rating?: number;
    price_level?: number;
    userReview?: {
      pros?: string;
      cons?: string;
      rating?: number;
      isRecommended?: boolean;
      images?: string[];
    };
  }) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("無效的餐廳 ID");
      }

      const updateFields: any = {};

      if (name !== undefined) updateFields.name = name;
      if (address !== undefined) updateFields.address = address;
      if (rating !== undefined) updateFields.rating = rating;
      if (price_level !== undefined) updateFields.price_level = price_level;

      if (userReview !== undefined) {
        updateFields.userReview = {
          ...userReview,
          updatedAt: new Date(),
        };
      }

      const restaurant = await Restaurant.findOneAndUpdate(
        { _id: id, isUserAdded: true },
        { $set: updateFields },
        { new: true }
      );

      if (!restaurant) throw new Error("找不到使用者新增的餐廳");

      return restaurant;
    } catch (error) {
      console.error("更新使用者餐廳失敗", error);
      throw error;
    }
  },

  updateGoogleRestaurantUserReview: async ({
    id,
    userReview,
  }: {
    id: string;
    userReview?: {
      pros?: string;
      cons?: string;
      rating?: number;
      isRecommended?: boolean;
      images?: string[];
    };
  }) => {
    try {
      // 只能更新 Google 取得的餐廳 (isUserAdded: false)
      const restaurant = await Restaurant.findOne({ _id: id, isUserAdded: false });
      if (!restaurant) throw new Error("找不到 Google 取得的餐廳");

      // userReview 是物件，不是陣列，若沒有則新增一個空物件
      if (!restaurant.userReview) {
        restaurant.userReview = {
          pros: "",
          cons: "",
          rating: 0,
          isRecommended: false,
          images: [],
          updatedAt: new Date(),
        };
      }

      if (userReview) {
        if (userReview.pros !== undefined) restaurant.userReview.pros = userReview.pros;
        if (userReview.cons !== undefined) restaurant.userReview.cons = userReview.cons;
        if (userReview.rating !== undefined) restaurant.userReview.rating = userReview.rating;
        if (userReview.isRecommended !== undefined) restaurant.userReview.isRecommended = userReview.isRecommended;
        if (userReview.images !== undefined) restaurant.userReview.images = userReview.images;
      }

      restaurant.userReview.updatedAt = new Date();

      await restaurant.save();

      return restaurant;
    } catch (error) {
      console.error("更新 Google 餐廳評論失敗", error);
      throw error;
    }
  },

  createUserAddedRestaurant: async ({
    name,
    address,
    rating,
    price_level,
    isRecommended,
    userReview,
  }: {
    name: string;
    address: string;
    rating?: number;
    price_level?: number;
    isRecommended?: boolean;
    userReview?: {
      pros?: string;
      cons?: string;
      rating?: number;
      isRecommended?: boolean;
      images?: string[];
    };
  }) => {
    try {
      const newRestaurant = new Restaurant({
        place_id: new mongoose.Types.ObjectId().toHexString(),
        name,
        address,
        distance: 0,
        rating: rating || 0,
        user_ratings_total: 0,
        types: [],
        price_level: price_level || 0,
        isUserAdded: true,
        isRecommended: isRecommended || false,
        createdAt: new Date(),
        userReview: userReview ? { ...userReview, updatedAt: new Date() } : undefined,
      });

      await newRestaurant.save();
      return newRestaurant;
    } catch (error) {
      console.error("❌ 新增使用者餐廳失敗", error);
      throw new Error("新增失敗：" + (error as Error).message);
    }
  }
};