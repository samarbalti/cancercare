// FIX: module 'natural' retiré — remplacé par une analyse manuelle légère
// Pour réinstaller natural si besoin : npm install natural

class StressDetectionService {
  constructor() {
    this.stressWords = {
      high: ['crise', 'urgence', 'mort', 'mourir', 'suicide', 'panique',
             'emergency', 'dying', 'death', 'kill', 'hopeless'],
      medium: ['peur', 'anxiété', 'stress', 'fatigué', 'douleur', 'angoisse',
               'fear', 'anxiety', 'tired', 'pain', 'worried', 'exhausted'],
      low: ['triste', 'mal', 'difficile', 'sad', 'bad', 'difficult', 'unhappy']
    };

    // Mots positifs pour analyse sentiment simple
    this.positiveWords = ['bien', 'bon', 'heureux', 'calme', 'good', 'happy', 'calm', 'ok', 'fine'];
    this.negativeWords = ['mal', 'mauvais', 'terrible', 'horrible', 'affreux', 'bad', 'awful', 'terrible'];
  }

  /**
   * Analyse simple du sentiment sans dépendance externe
   */
  getSentimentScore(tokens) {
    let score = 0;
    tokens.forEach(token => {
      if (this.positiveWords.includes(token)) score += 1;
      if (this.negativeWords.includes(token)) score -= 1;
    });
    return tokens.length > 0 ? score / tokens.length : 0;
  }

  /**
   * Tokenizer simple
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-zàâäéèêëîïôùûüç\s]/gi, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1);
  }

  analyze(text) {
    const lower = text.toLowerCase();
    const tokens = this.tokenize(lower);
    const sentiment = this.getSentimentScore(tokens);

    let score = 0;
    const keywords = [];

    this.stressWords.high.forEach(w => {
      if (lower.includes(w)) {
        score += 25;
        keywords.push({ word: w, level: 'high' });
      }
    });

    this.stressWords.medium.forEach(w => {
      if (lower.includes(w)) {
        score += 15;
        keywords.push({ word: w, level: 'medium' });
      }
    });

    this.stressWords.low.forEach(w => {
      if (lower.includes(w)) {
        score += 5;
        keywords.push({ word: w, level: 'low' });
      }
    });

    if (sentiment < -0.5) score += 20;
    else if (sentiment < 0) score += 10;

    score = Math.min(100, Math.max(0, score));

    const intensity = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

    return {
      detected: score > 30 || keywords.length > 0,
      score: Math.round(score),
      intensity,
      sentiment: {
        score: sentiment,
        label: sentiment < -0.3 ? 'negative' : 'positive'
      },
      keywords,
      requiresAlert: score >= 70,
      recommendations: this.getRecommendations(score),
      timestamp: new Date().toISOString()
    };
  }

  getRecommendations(score) {
    if (score >= 70) return [
      '🚨 Contactez immédiatement votre équipe médicale',
      'Respirez : 4s inspiration, 7s rétention, 8s expiration',
      'Appelez le 15 (SAMU) si nécessaire'
    ];
    if (score >= 40) return [
      '⚠️ Essayez la méditation guidée',
      'Faites une promenade de 10 minutes',
      'Parlez à un proche'
    ];
    return [
      '💚 Continuez vos techniques de relaxation',
      'Maintenez votre routine de sommeil'
    ];
  }
}

module.exports = new StressDetectionService();