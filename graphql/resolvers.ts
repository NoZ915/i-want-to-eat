import Restaurant from "../models/restaurantModel";

export const root = {
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
  }
};