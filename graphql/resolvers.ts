import Restaurant from "../models/restaurantModel";
import mongoose, { SortOrder } from "mongoose";

export const resolvers = {
  restaurants: async ({
    page = 1,
    limit = 10,
    sortBy = "createdAt", // 預設排序欄位
    order = "desc",       // 預設排序方式
    search,
  }: {
    page: number;
    limit: number;
    sortBy?: string;
    order?: "asc" | "desc";
    search?: string;
  }) => {
    const skip = (page - 1) * limit;

    // 建立搜尋條件
    const filter: any = {};
    if (search) {
      const regex = new RegExp(search, "i"); // 不區分大小寫
      filter.$or = [{ name: regex }, { address: regex }];
    }

    // 確保 sort 欄位合法，避免使用者傳奇怪的欄位造成錯誤
    const validSortFields = [
      "rating",
      "price_level",
      "createdAt",
      "user_ratings_total",
      "name",
      "distance"
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;

    const sort: { [key: string]: SortOrder } = { [sortField]: sortOrder };

    const [data, total] = await Promise.all([
      Restaurant.find(filter).sort(sort).skip(skip).limit(limit),
      Restaurant.countDocuments(filter),
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

  updateRestaurant: async ({
    id,
    name,
    address,
    rating,
    price_level,
    userReview
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
  
      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        throw new Error("找不到餐廳");
      }
  
      // 更新基本欄位（僅限 isUserAdded 餐廳）
      if (restaurant.isUserAdded) {
        if (name !== undefined) restaurant.name = name;
        if (address !== undefined) restaurant.address = address;
        if (rating !== undefined) restaurant.rating = rating;
        if (price_level !== undefined) restaurant.price_level = price_level;
      }
  
      // 更新使用者評論（userReview）
      if (!restaurant.userReview) {
        restaurant.userReview = {
          pros: "",
          cons: "",
          rating: 0,
          isRecommended: false,
          images: [],
          updatedAt: new Date()
        };
      }
  
      if (userReview) {
        if (userReview.pros !== undefined) restaurant.userReview.pros = userReview.pros;
        if (userReview.cons !== undefined) restaurant.userReview.cons = userReview.cons;
        if (userReview.rating !== undefined) restaurant.userReview.rating = userReview.rating;
        if (userReview.isRecommended !== undefined) restaurant.userReview.isRecommended = userReview.isRecommended;
        if (userReview.images !== undefined) restaurant.userReview.images = userReview.images;
        restaurant.userReview.updatedAt = new Date();
      }
  
      await restaurant.save();
      return restaurant;
    } catch (error) {
      console.error("更新餐廳失敗", error);
      throw error;
    }
  },

  createUserAddedRestaurant: async ({
    name,
    address,
    rating,
    price_level,
    userReview,
  }: {
    name: string;
    address: string;
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
