// debug.js - À exécuter avec: node debug.js
console.log('=== DEBUG IMPORTS ===\n');

try {
  const chatbotController = require('./src/controllers/chatbotController');
  console.log('✅ chatbotController loaded');
  console.log('Exports:', Object.keys(chatbotController));
  
  if (chatbotController.sendMessage) {
    console.log('✅ sendMessage exists');
  } else {
    console.log('❌ sendMessage is UNDEFINED');
  }
  
} catch (err) {
  console.log('❌ Error loading chatbotController:', err.message);
}

console.log('\n=== END DEBUG ===');