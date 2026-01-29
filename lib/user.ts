import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // --- Basic Info ---
  name: { 
    type: String, 
    required: [true, 'Please provide a name'],
  },
  email: { 
    type: String, 
    required: [true, 'Please provide an email'], 
    unique: true,
  },
  password: { 
    type: String, 
    required: false, // False if using Google Auth, True if using Credentials
  },
  avatar: { 
    type: String, 
    default: 'https://i.pravatar.cc/150?u=default' 
  },

  // --- Current Role ---
  role: { 
    type: String, 
    enum: ['participant', 'organizer', 'admin'], 
    default: 'participant' 
  },

  // --- ROLE REQUEST FIELDS (REQUIRED FOR YOUR API) ---
  roleRequestStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none' // Default state
  },
  requestedRole: {
    type: String,
    enum: ['organizer'], // Roles they can ask for
    default: null
  },
  
  // --- Optional: Organizer Details ---
  organizationName: {
    type: String,
    default: null
  },

  // --- Student Details ---
  department: String,
  skills: [String],

}, { timestamps: true });

// Prevent recompilation of model in Next.js hot reloading
export default mongoose.models.User || mongoose.model('User', UserSchema);