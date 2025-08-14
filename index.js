require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const userRouter = require("./routes/user");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { checkAuthCookie } = require("./middlewares/auth");
const blogRoute = require("./routes/blog");
const Blog = require("./models/blog");

const app = express();
const PORT = process.env.PORT || 8000;

// Use env var if available, otherwise local DB
const mongoUri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/blogKaro";

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`✅ Connected to MongoDB: ${mongoUri}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit if DB can't connect
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(checkAuthCookie("token"));
app.use(express.static(path.resolve("./public")));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRouter);
app.use("/blog", blogRoute);
app.use("/uploads", express.static("public/uploads"));

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
