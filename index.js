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

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

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

app.listen(4000, () => {
  console.log("server started");
});
