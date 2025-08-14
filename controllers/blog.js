const Blog = require("../models/blog");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

async function handleAddBlog(req, res) {
  try {
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILE:", req.file);
    
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).send("Title and body required");

    let imageUrl;

    if (process.env.NODE_ENV === "production") {
      if (!req.file) return res.status(400).send("Image file required");

      console.log("Uploading file to Cloudinary:", req.file.path);
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "blog_images" });
      imageUrl = result.secure_url;

      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.warn("Failed to delete temp file:", err);
      }
    } else {
      if (!req.file) return res.status(400).send("Image file required");
      imageUrl = `/uploads/${req.file.filename}`;
    }

    console.log({ title, body, createdBy: req.user?._id, blogImgURL: imageUrl });

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
