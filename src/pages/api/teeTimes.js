import connectDB from '../../../db';
import TeeTime from '../../../models/TeeTime';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const { name, time, players, holes } = req.body;
    const teeTime = new TeeTime({ name, time, players, holes });
    await teeTime.save();
    res.status(201).json({ message: 'teeTime created!' });
  } else if (req.method === 'GET') {
    const teeTimes = await TeeTime.find();
    res.status(200).json(teeTimes);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default connectDB(handler);