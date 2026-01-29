import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },
  role: { 
    type: String, 

    enum: ['student', 'teacher', 'organizer', 'canteen_manager', 'admin'], 
    default: 'student' 
  },
  
  // --- ACCOUNT CONTROL FIELDS ---
  accountStatus: {
    type: String,
    enum: ['pending', 'active', 'blocked'], 
    default: 'pending' 
  },
  
  // Organizer specific
  organizationName: String,
  roleRequestStatus: String, 

}, { timestamps: true });
export default mongoose.models.User || mongoose.model('User', UserSchema);