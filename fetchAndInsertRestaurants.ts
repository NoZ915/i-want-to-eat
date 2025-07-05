import "dotenv/config";
import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import Restaurant from "./models/restaurantModel";

const app = express();
const port = process.env.PORT || 3000;

const LAT = 22.651373604896655;
const LNG = 120.30332454684512;
const RADIUS = 200; // 公尺
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// 計算地球兩點距離（Haversine）
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => x * Math.PI / 180;
  const R = 6371e3;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Step 1: Google Places API 抓資料
const fetchAndInsertRestaurants = async () => {
  let nextPageToken: string | null = null;
  let totalFetched = 0;
  let page = 1;

  do {
    try {
      const params: any = {
        location: `${LAT},${LNG}`,
        radius: RADIUS,
        type: "restaurant",
        language: "zh-TW",
        key: process.env.GOOGLE_API_KEY,
      };

      if (nextPageToken) {
        params.pagetoken = nextPageToken;
        await delay(2500); // ⏱️ 必須等待 2 秒以上，Google 才會開放 token
      }

      const response = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", {
        params,
      });

      const results = response.data.results;

      for (const place of results) {
        const location = place.geometry.location;
        const distance = Math.round(haversineDistance(LAT, LNG, location.lat, location.lng));

        const googleData = {
          name: place.name,
          address: place.vicinity,
          location,
          distance,
          rating: place.rating,
          user_ratings_total: place.user_ratings_total,
          types: place.types,
          price_level: place.price_level,
        };

        await Restaurant.findOneAndUpdate(
          { place_id: place.place_id },
          {
            $set: googleData,
            $setOnInsert: {
              place_id: place.place_id,
              isUserAdded: false,
              createdAt: new Date(),
              isRecommended: false,
              pros: "",
              cons: "",
              userRating: 0,
              images: [],
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      console.log(`✅ 第 ${page} 頁：更新 ${results.length} 筆資料`);
      totalFetched += results.length;
      page++;

      nextPageToken = response.data.next_page_token || null;

    } catch (err) {
      console.error("❌ 錯誤");
      break;
    }
  } while (nextPageToken);

  console.log(`🍽️ 共抓取 ${totalFetched} 筆餐廳資料`);
};

// Step 2: Mongoose + Express 啟動
mongoose.connect(process.env.MONGO_URI!)
  .then(async () => {
    console.log("✅ 已連線 MongoDB");
    await fetchAndInsertRestaurants();
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB 連線錯誤", err);
  });