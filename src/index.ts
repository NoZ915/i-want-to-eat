import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { graphqlHTTP } from "express-graphql";
import { schema } from "../graphql/schema";
import { resolvers } from "../graphql/resolvers";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 掛載 GraphQL
app.use("/graphql", graphqlHTTP({
  schema,
  rootValue: resolvers,
  graphiql: true, // 可用瀏覽器測試
}));

mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("✅ 已連線 MongoDB");
    app.listen(port, () => {
      console.log(`🚀 Server is running on PORT:${port}`);
      console.log(`🔍 GraphQL endpoint: http://localhost:${port}/graphql`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB 連線錯誤", err);
  });