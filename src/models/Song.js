import mongoose from 'mongoose'

// Define the Song schema
const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  daysReleased: Number,
  position: Number,
  top10: Number,
  peakPosition: Number,
  peakPositionTimes: String,
  peakStreams: Number,
  totalStreams: Number
})

export default mongoose.model('Song', songSchema)