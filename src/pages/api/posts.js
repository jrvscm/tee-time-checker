import connectDB from '../../../db';
import Post from '../../../models/Post';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const { title, content } = req.body;
    const post = new Post({ title, content });
    await post.save();
    res.status(201).json({ message: 'Post created!' });
  } else if (req.method === 'GET') {
    const posts = await Post.find();
    res.status(200).json(posts);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default connectDB(handler);