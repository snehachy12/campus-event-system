import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Core Details
  eventType: { 
    type: String, 
    enum: ['workshop', 'technical', 'cultural', 'sports', 'seminar'],
    required: true 
  },
  mode: { type: String, enum: ['offline', 'online', 'hybrid'], default: 'offline' },
  venue: { type: String, required: true }, // e.g., "Auditorium" or "Zoom Link"
  
  // Timing
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true }, // e.g. "10:00 AM"
  endTime: { type: String, required: true },
  
  // Registration
  capacity: { type: Number, required: true },
  price: { type: Number, default: 0 }, // 0 = Free
  registrationDeadline: { type: Date },

  // --- DYNAMIC FIELDS (Optional based on category) ---
  theme: { type: String },          // For Cultural
  techStack: { type: String },      // For Technical/Hackathon
  prerequisites: { type: String },  // For Workshops
  sportType: { type: String },      // For Sports (e.g., Cricket, Chess)
  
  status: { 
    type: String, 
    enum: ['draft', 'published', 'cancelled', 'completed'], 
    default: 'published' 
  },
  
  // Media
  bannerUrl: { type: String }, // Optional image URL

}, { timestamps: true });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);