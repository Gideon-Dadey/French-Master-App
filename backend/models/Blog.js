const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  excerpt: { type: String },
  content: { type: String },
  contentType: { type: String, enum: ['text', 'html'], default: 'text' },
  author: { type: String, default: 'Elvis Kossi FIATI' },
  category: {
    type: String,
    enum: ['written-lessons', 'news', 'other'],
    default: 'other',
  },
  type: { type: String },
  image: { type: String },
  url: { type: String },
  readTime: { type: String },
  publishedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'published'], default: 'published' },
}, { timestamps: true });

blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
blogSchema.index({ category: 1, publishedAt: -1 });
blogSchema.index({ featured: 1, publishedAt: -1 });

module.exports = mongoose.model('Blog', blogSchema);

