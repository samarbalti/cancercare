require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Supprimer l'admin existant
    await User.deleteOne({ email: 'admin@test.com' });
    
    // Créer le nouvel admin
    const admin = await User.create({
      email: 'admin@test.com',
      password: '123456',
      firstName: 'Admin',
      lastName: 'System',
      role: 'admin',
      isActive: true
    });
    
    console.log('✅ Admin créé avec succès!');
    console.log('Email:', admin.email);
    console.log('Mot de passe: 123456');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

createAdmin();