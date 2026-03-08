const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Patient = require('./src/models/Patient');
const User = require('./src/models/User');
const Doctor = require('./src/models/Doctor');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    // Trouver un patient
    const user = await User.findOne({ role: 'patient' });
    console.log('User found:', user.email);
    console.log('User ID:', user._id);
    
    // Tester la requête exacte du controller
    const patient = await Patient.findOne({ user: user._id })
      .populate('user', '-password')
      .populate({ path: 'assignedDoctor', select: 'user specialization hospital', strictPopulate: false })
      .lean();
    
    console.log('\n📋 Patient Profile Structure:');
    console.log(JSON.stringify(patient, null, 2));
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
