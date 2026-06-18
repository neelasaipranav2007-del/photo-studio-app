const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  imageUrl: {
    type: String,
  },
  seoTitle: String,
  seoDescription: String,
}, { timestamps: true });

const BlogPost = mongoose.model('BlogPost', blogPostSchema);
module.exports = BlogPost;
