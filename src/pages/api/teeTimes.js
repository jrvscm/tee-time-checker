import connectDB from '../../../db.js';
import TeeTime from '../../../models/TeeTime';

export const handler = async (req, res) => {
  if (req.method === 'POST') {
    const { name, date, time, players, holes } = req.body;

    //parse
    const dateTimeString = `${date} ${time}`;
    const parsedTime = new Date(dateTimeString);

    // Calculate the estimated finish time
    let estimatedFinishTime;
    if (holes === 9) {
        estimatedFinishTime = new Date(parsedTime.getTime() + 2.5 * 60 * 60 * 1000);
    } else if (holes === 18) {
        estimatedFinishTime = new Date(parsedTime.getTime() + 4.5 * 60 * 60 * 1000);
    }

    //get the currently booked tee times in the db
    const bookedTeeTimes = await TeeTime.find();
    
    // Filter booked tee times that overlap with the desired tee time
    const overlappingTeeTimes = bookedTeeTimes.filter((teeTime) => {
        const teeTimeStart = new Date(teeTime.time);
        const teeTimeFinish = new Date(teeTimeStart.getTime() + (teeTime.holes === 9 ? 2.5 : 4.5) * 60 * 60 * 1000);
        return parsedTime < teeTimeFinish && teeTimeStart < estimatedFinishTime;
    });
    
    // Check if there are already 4 players during the overlapping tee times
    let numPlayersBooked = players;
    overlappingTeeTimes.forEach((teeTime) => {
        numPlayersBooked += teeTime.players;
    });
    if (numPlayersBooked > 4) {
        res.status(200).json({ 
            success: false,
            message: 'Sorry, there are already 4 users playing during this time, or there will be after the start of your desired tee time. The earliest available tee time is ' + estimatedFinishTime.toLocaleString() + '.',
        });
    } else {
        const teeTime = new TeeTime({ name, time: parsedTime, players, holes });
        await teeTime.save();
        res.status(200).json({ 
            success: true,
            message: 'The tee time at ' + parsedTime.toLocaleString() + ' is available!' 
        });
    }
  } 
  else if (req.method === 'GET') {
    const teeTimes = await TeeTime.find();
    res.status(200).json(teeTimes);
  } 
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default connectDB(handler);