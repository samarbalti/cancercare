const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugLogin() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cancercare');
    console.log('✅ Connecté à MongoDB');

    // Récupérer l'admin avec le mot de passe
    const admin = await User.findOne({ email: 'admin@test.com' }).select('+password');
    if (!admin) {
      console.log('❌ Admin non trouvé');
      return;
    }

    console.log('👑 Admin trouvé:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Mot de passe hashé: ${admin.password ? 'Oui' : 'Non'}`);
    console.log(`   Longueur hash: ${admin.password ? admin.password.length : 0}`);

    // Tester la comparaison de mot de passe
    const testPassword = 'Admin123!';
    console.log(`\n🔍 Test de comparaison avec "${testPassword}":`);

    try {
      const isMatch = await admin.comparePassword(testPassword);
      console.log(`   Résultat: ${isMatch ? '✅ Correct' : '❌ Incorrect'}`);
    } catch (error) {
      console.log(`   Erreur lors de la comparaison: ${error.message}`);
    }

    // Tester avec bcrypt directement
    try {
      const directCompare = await bcrypt.compare(testPassword, admin.password);
      console.log(`   Comparaison directe bcrypt: ${directCompare ? '✅ Correct' : '❌ Incorrect'}`);
    } catch (error) {
      console.log(`   Erreur bcrypt direct: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le script
debugLogin();