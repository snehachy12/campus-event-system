import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft',
  },
  capacity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Check if the model exists before creating a new one (Next.js fix)
export default mongoose.models.Event || mongoose.model('Event', EventSchema);