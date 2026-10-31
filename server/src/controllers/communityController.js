const Post = require('../models/Post');

const createPost = async (req, res, next) => {
  try {
    const { title, company, content, tags } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });

    const post = await Post.create({
      author: req.user._id,
      title,
      company: company || '',
      content,
      tags: Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()).filter(Boolean) : [],
    });

    const populated = await post.populate('author', 'name college');
    res.status(201).json({ post: populated });
  } catch (err) {
    next(err);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const search = (req.query.search || '').trim();

    const filter = search ? { $text: { $search: search } } : {};

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'name college')
        .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Post.countDocuments(filter),
    ]);

    const shaped = posts.map((p) => ({
      id: p._id,
      title: p.title,
      company: p.company,
      content: p.content,
      tags: p.tags,
      likeCount: p.likes.length,
      likedByMe: p.likes.some((id) => id.equals(req.user._id)),
      author: p.author,
      createdAt: p.createdAt,
    }));

    res.json({ posts: shaped, page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) });
  } catch (err) {
    next(err);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const alreadyLiked = post.likes.some((id) => id.equals(userId));

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => !id.equals(userId));
    } else {
      post.likes.push(userId);
    }
    await post.save();

    res.json({ likeCount: post.likes.length, likedByMe: !alreadyLiked });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const isOwner = post.author.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not allowed to delete this post' });

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPost, getPosts, toggleLike, deletePost };