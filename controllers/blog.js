const Blog = require("../models/blog");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

async function handleAddBlog(req, res) {
  try {
    const { title, body } = req.body;
    let imageUrl;

    if (process.env.NODE_ENV === "production") {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "blog_images", // Optional: organizes uploads in Cloudinary
      });
      imageUrl = result.secure_url;

      // Delete the temp file after upload
      fs.unlinkSync(req.file.path);
    } else {
      // Local storage path
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Create blog in DB
    const blog = await Blog.create({
      title,
      body,
      createdBy: req.user._id,
      blogImgURL: imageUrl,
    });

    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error("Error adding blog:", error);
    res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  handleAddBlog,
};
