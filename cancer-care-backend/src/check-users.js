const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cancercare');
    console.log('✅ Connecté à MongoDB');

    // Récupérer tous les utilisateurs
    const users = await User.find({}).select('email firstName lastName role isActive');
    console.log(`\n📋 Utilisateurs trouvés: ${users.length}`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.firstName} ${user.lastName} (${user.role}) - ${user.isActive ? 'Actif' : 'Inactif'}`);
    });

    // Vérifier spécifiquement l'admin
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      console.log(`\n👑 Admin trouvé: ${admin.email}`);
      console.log(`   Nom: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Actif: ${admin.isActive}`);
      console.log(`   Email vérifié: ${admin.emailVerified}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le script
checkUsers();