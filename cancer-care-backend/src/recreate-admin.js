const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function recreateAdmin() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cancercare');
    console.log('✅ Connecté à MongoDB');

    // Supprimer l'admin existant
    await User.deleteOne({ email: 'admin@test.com' });
    console.log('🗑️ Admin existant supprimé');

    // Créer un nouveau compte admin
    const adminData = {
      email: 'admin@test.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'System',
      role: 'admin',
      phone: '+33123456789',
      isActive: true,
      emailVerified: true
    };

    const admin = await User.create(adminData);
    console.log('✅ Nouveau compte admin créé!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Mot de passe:', adminData.password);
    console.log('🔗 Rôle:', admin.role);
    console.log('✅ Email vérifié:', admin.emailVerified);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le script
recreateAdmin();