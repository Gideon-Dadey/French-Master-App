const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape blog posts from thefrenchmastergh.com
 * This function fetches and parses blog posts from the website
 */
const scrapeBlogPosts = async (page = 1) => {
  try {
    const url = page === 1 
      ? 'https://thefrenchmastergh.com/news-blog/'
      : `https://thefrenchmastergh.com/news-blog/page/${page}/`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const $ = cheerio.load(response.data);
    const posts = [];

    // Parse blog posts from the HTML
    $('article, .post, .blog-post').each((index, element) => {
      const $el = $(element);
      
      const title = $el.find('h2 a, h3 a, .entry-title a, a h2').first().text().trim() || 
                    $el.find('h2, h3, .entry-title').first().text().trim();
      const link = $el.find('h2 a, h3 a, .entry-title a, a').first().attr('href') || 
                   $el.find('a').first().attr('href');
      const excerpt = $el.find('.excerpt, .entry-excerpt, p').first().text().trim();
      const date = $el.find('.date, .published-date, time').first().text().trim() || 
                   $el.find('.meta-date').first().text().trim();
      const category = $el.find('.category, .post-category').first().text().trim() || 'other';
      const image = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src');

      if (title) {
        posts.push({
          title,
          excerpt,
          url: link ? (link.startsWith('http') ? link : `https://thefrenchmastergh.com${link}`) : null,
          date,
          category: category.toLowerCase().includes('written') ? 'written-lessons' : 
                    category.toLowerCase().includes('news') ? 'news' : 'other',
          type: category,
          image: image ? (image.startsWith('http') ? image : `https://thefrenchmastergh.com${image}`) : null,
          author: 'Elvis Kossi FIATI',
        });
      }
    });

    // Alternative parsing if the above doesn't work - look for common WordPress/blog patterns
    if (posts.length === 0) {
      $('.entry, .post-content, article').each((index, element) => {
        const $el = $(element);
        const title = $el.find('h2, h3').first().text().trim();
        const link = $el.find('a').first().attr('href');
        
        if (title && link) {
          posts.push({
            title,
            url: link.startsWith('http') ? link : `https://thefrenchmastergh.com${link}`,
            category: 'other',
            author: 'Elvis Kossi FIATI',
          });
        }
      });
    }

    return posts;
  } catch (error) {
    console.error('Error scraping blog posts:', error);
    throw error;
  }
};

/**
 * Sync blog posts from website to database
 */
const syncBlogPosts = async () => {
  try {
    let allPosts = [];
    
    // Scrape pages 1-4
    for (let page = 1; page <= 4; page++) {
      const posts = await scrapeBlogPosts(page);
      allPosts = [...allPosts, ...posts];
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Save to database
    for (const postData of allPosts) {
      const slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      await Blog.findOneAndUpdate(
        { slug },
        {
          ...postData,
          slug,
          publishedAt: postData.date ? new Date(postData.date) : new Date(),
        },
        { upsert: true, new: true }
      );
    }

    return allPosts.length;
  } catch (error) {
    console.error('Error syncing blog posts:', error);
    throw error;
  }
};

// @route   GET /api/blog
// @desc    Get all blog posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 20, search } = req.query;
    const query = { status: 'published' };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const posts = await Blog.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      count: posts.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/blog/:id
// @desc    Get single blog post
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid blog post ID format' 
      });
    }

    const post = await Blog.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/blog/category/:category
// @desc    Get blog posts by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Blog.find({ category, status: 'published' })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Blog.countDocuments({ category, status: 'published' });

    res.json({
      success: true,
      count: posts.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching blog posts by category:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   GET /api/blog/featured
// @desc    Get featured blog posts
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const posts = await Blog.find({ featured: true, status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(10);

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching featured blog posts:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   POST /api/blog/sync
// @desc    Sync blog posts from website (Admin only - add auth middleware if needed)
// @access  Private
router.post('/sync', async (req, res) => {
  try {
    const count = await syncBlogPosts();
    res.json({ 
      success: true, 
      message: `Successfully synced ${count} blog posts`,
      count,
    });
  } catch (error) {
    console.error('Error syncing blog posts:', error);
    res.status(500).json({ success: false, message: 'Error syncing blog posts', error: error.message });
  }
});

module.exports = router;

