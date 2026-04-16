const axios = require('axios');

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.baseURL = 'https://api.groq.com/openai/v1';
    this.model = 'llama-3.3-70b-versatile';
    
    if (!this.apiKey || this.apiKey === 'your_groq_api_key_here') {
      console.log('⚠️ GROQ_API_KEY non configurée - mock response sera utilisée');
    } else {
      console.log('✅ GROQ_API_KEY configurée - utilisation de Groq uniquement');
    }
  }

  async askGroq(messages, options = {}) {
    try {
      // Check if API key is available
      if (!this.apiKey || this.apiKey === 'your_groq_api_key_here') {
        console.log('⚠️ Groq API key not configured, using mock response');
        return this.getMockResponse(messages);
      }

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || this.model,
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 4096
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('❌ Groq error:', error.response?.data?.error?.message || error.message);
      console.log('⚠️ Groq API failed, using mock response');
      return this.getMockResponse(messages);
    }
  }

  getMockResponse(messages) {
    const userMessage = messages[messages.length - 1]?.content || '';
    const lowerMessage = userMessage.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.includes('bonjour') || lowerMessage.includes('hello') || lowerMessage.includes('salut')) {
      return "Bonjour ! Je suis Dr. Sara, votre assistante IA spécialisée en santé et oncologie. Comment puis-je vous aider aujourd'hui ? Je peux répondre à vos questions sur le cancer, les traitements, la gestion du stress, ou tout autre sujet de santé qui vous préoccupe.";
    }
    
    // Cancer and treatment questions
    if (lowerMessage.includes('cancer') || lowerMessage.includes('traitement') || lowerMessage.includes('chimiothérapie') || lowerMessage.includes('radiothérapie')) {
      return "Je comprends que vous vous posez des questions sur le cancer et les traitements. Chaque situation est unique et nécessite un suivi médical personnalisé. Je vous recommande de consulter votre oncologue pour des conseils adaptés à votre cas spécifique. En attendant, je peux vous fournir des informations générales sur les traitements courants comme la chimiothérapie, la radiothérapie, l'immunothérapie, etc. Quelle question spécifique avez-vous ?";
    }
    
    // Stress and anxiety
    if (lowerMessage.includes('stress') || lowerMessage.includes('anxiété') || lowerMessage.includes('angoisse') || lowerMessage.includes('peur')) {
      return "Le stress et l'anxiété sont courants pendant un traitement contre le cancer. Voici quelques techniques qui peuvent aider : la respiration profonde (inspirez 4 secondes, retenez 7 secondes, expirez 8 secondes), la méditation guidée, des exercices de relaxation musculaire, ou une activité physique douce. N'hésitez pas à en parler avec votre équipe médicale - ils peuvent vous orienter vers un psychologue spécialisé ou des groupes de soutien. Comment vous sentez-vous en ce moment ?";
    }
    
    // Symptoms and side effects
    if (lowerMessage.includes('symptôme') || lowerMessage.includes('effet secondaire') || lowerMessage.includes('nausée') || lowerMessage.includes('fatigue')) {
      return "Les effets secondaires des traitements peuvent être difficiles à gérer. Pour la fatigue, essayez de faire des siestes courtes et de l'exercice léger. Pour les nausées, votre médecin peut prescrire des anti-nauséeux. Il est important de signaler tous vos symptômes à votre équipe médicale pour qu'ils puissent ajuster votre traitement. Quels symptômes ressentez-vous actuellement ?";
    }
    
    // Nutrition and diet
    if (lowerMessage.includes('alimentation') || lowerMessage.includes('nutrition') || lowerMessage.includes('manger') || lowerMessage.includes('repas')) {
      return "Une bonne alimentation est importante pendant les traitements. Concentrez-vous sur des aliments frais, riches en protéines et en légumes. Si vous avez des difficultés à manger, parlez-en à votre diététicien. Ils peuvent vous aider à adapter votre alimentation à vos besoins spécifiques. Avez-vous des questions particulières sur l'alimentation ?";
    }
    
    // General health questions
    if (lowerMessage.includes('santé') || lowerMessage.includes('prévention') || lowerMessage.includes('vaccin')) {
      return "La prévention et le maintien d'une bonne santé sont essentiels. Je peux vous donner des conseils généraux sur l'hygiène de vie, l'exercice physique, et les dépistages. Cependant, pour des conseils personnalisés, consultez votre médecin. Quelle aspect de la santé vous intéresse ?";
    }
    
    // Emotional support
    if (lowerMessage.includes('seul') || lowerMessage.includes('déprimé') || lowerMessage.includes('triste') || lowerMessage.includes('soutien')) {
      return "Il est normal de se sentir seul ou déprimé pendant cette période. Vous n'êtes pas seul - de nombreuses ressources existent : groupes de soutien, psychologues spécialisés, associations de patients. Votre équipe médicale peut vous aider à trouver du soutien approprié. Souhaitez-vous que je vous donne des contacts d'associations ?";
    }
    
    // Default response for any other question
    return "Je suis là pour vous accompagner dans votre parcours de santé. Je peux répondre à vos questions sur le cancer, les traitements, la gestion des symptômes, le bien-être émotionnel, et de nombreux autres sujets liés à la santé. Pouvez-vous me donner plus de détails sur ce qui vous préoccupe ? Si c'est urgent, contactez immédiatement votre médecin ou les urgences.";
  }
}

module.exports = new GroqService();