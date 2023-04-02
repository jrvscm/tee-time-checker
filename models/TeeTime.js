import mongoose from 'mongoose';

const teeTimeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  holes: {
    type: Number,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  players: {
    type: Number,
    required: true,  
  }
});

const teeTime = mongoose.models.TeeTime || mongoose.model('TeeTime', teeTimeSchema);

export default teeTime;