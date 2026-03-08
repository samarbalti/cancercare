const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const Patient = require('./src/models/Patient');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const users = await User.find({ role: 'patient' });
    console.log(`\n📊 Found ${users.length} patient users`);
    
    for (const user of users) {
      const patient = await Patient.findOne({ user: user._id });
      console.log(`\n👤 User: ${user.email}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Profile: ${patient ? '✅ EXISTS' : '❌ MISSING'}`);
      
      if (!patient) {
        console.log('   ⚠️  Creating missing profile...');
        await Patient.create({
          user: user._id,
          dateOfBirth: new Date('1990-01-01'),
          gender: 'other',
          bloodType: 'O+'
        });
        console.log('   ✅ Profile created');
      }
    }
    
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
