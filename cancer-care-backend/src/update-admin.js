const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function updateAdmin() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cancercare');
    console.log('✅ Connecté à MongoDB');

    // Mettre à jour l'admin existant
    const result = await User.updateOne(
      { email: 'admin@test.com' },
      {
        emailVerified: true,
        isActive: true,
        firstName: 'Admin',
        lastName: 'System'
      }
    );

    if (result.modifiedCount > 0) {
      console.log('✅ Admin mis à jour avec succès!');
    } else {
      console.log('ℹ️ Aucun admin trouvé ou déjà à jour');
    }

    // Vérifier l'admin
    const admin = await User.findOne({ email: 'admin@test.com' });
    if (admin) {
      console.log('👑 Admin actuel:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Nom: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Email vérifié: ${admin.emailVerified}`);
      console.log(`   Actif: ${admin.isActive}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le script
updateAdmin();