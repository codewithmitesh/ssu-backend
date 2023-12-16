const cloudinary = require("cloudinary").v2;
const Blog = require("../model/blogModel");



exports.createBlog = async (req, res) => {
  try {
    const { title, description, heading } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({ status: false, message: "Please provide a title" });
    }

    if (!description) {
      return res.status(400).json({ status: false, message: "Please provide a description" });
    }

    if (!heading) {
      return res.status(400).json({ status: false, message: "Please provide heading" });
    }

    if (!req.files || !req.files.img) {
      return res.status(400).json({ status: false, message: "Please provide an image for the blog" });
    }

    const image = req.files.img;


    const result = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: "blog_images"
    });

  
    const newBlog = new Blog({
      title,
      description,
      heading,
      img: {
        public_Id: result.public_id,
        url: result.secure_url
      }
    });

    let saveBlog = await newBlog.save();

    res.status(201).json({ status: true, data: saveBlog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};


exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, heading, description, img } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ status: false, message: "Blog post not found" });
    }

    if (title) {
      blog.title = title;
    }

    if (heading) {
      blog.heading = heading;
    }

    if (description) {
      blog.description = description;
    }


    if (img) {

      await cloudinary.uploader.destroy(blog.img.public_Id);

      const uploadedImage = await cloudinary.uploader.upload(img, {
        folder: "blog_images"
      });

      blog.img.public_Id = uploadedImage.public_id;
      blog.img.url = uploadedImage.secure_url;
    }

    await blog.save();

    res.json({ status: true, message: "Blog post updated successfully", data: blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();

    res.json({ status: true, data: blogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};


///////////////////////////////// admin + user /////////////
exports.getSingleBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ status: false, message: "Blog post not found" });
    }

    res.json({ status: true, data: blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ status: false, message: "Blog post not found" });
    }

    await Blog.findOneAndDelete({ _id: id }, { new: true })

    await cloudinary.uploader.destroy(blog.img.public_Id);

    res.json({ status: true, message: "Blog post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: error.message });
  }
};




////////////////////////////////// blog for user ////////