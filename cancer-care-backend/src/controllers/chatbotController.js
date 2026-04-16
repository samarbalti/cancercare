const groqService = require('../services/groqservice.js');
const ragService = require('../services/ragService.js');
const stressService = require('../services/stressService.js');
const ocrService = require('../services/ocrService.js');
const ChatHistory = require('../models/ChatHistory.js');
const Patient = require('../models/Patient.js');

class ChatbotController {
  chat = async (req, res) => {
    try {
      const { message, sessionId = null } = req.body;
      const patientId = req.user?.patientId || req.user?.id;

      if (!message) {
        return res.status(400).json({ error: 'Message requis' });
      }

      let session = null;
      
      // Only create session if user is authenticated
      if (patientId) {
        session = sessionId ? await ChatHistory.findOne({ sessionId }) : null;
        if (!session) {
          session = new ChatHistory({ patientId, messages: [] });
        }
      }

      // Analyze stress
      const stressAnalysis = stressService.analyze(message);

      // RAG enhancement - use session messages if available
      const sessionMessages = session ? session.messages : [];
      const ragResult = await ragService.enhanceQueryWithContext(message, sessionMessages);

      // Build messages for Groq
      const messages = [
        {
          role: 'system',
          content: this.buildSystemMessage(stressAnalysis, ragResult)
        },
        ...sessionMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: ragResult.enhancedQuery }
      ];

      // Get response from Groq
      const response = await groqService.askGroq(messages, {
        temperature: stressAnalysis.detected ? 0.8 : 0.7
      });

      // Save messages only if user is authenticated
      if (session && patientId) {
        session.messages.push({
          role: 'user',
          content: message,
          stressAnalysis: stressAnalysis.detected ? stressAnalysis : undefined,
          timestamp: new Date()
        });

        session.messages.push({
          role: 'assistant',
          content: response,
          sources: ragResult.sources.map(s => ({
            documentId: s.documentId,
            title: s.metadata.title,
            similarity: s.similarity
          })),
          timestamp: new Date()
        });

        if (stressAnalysis.requiresAlert) {
          session.metadata.stressPeaks += 1;
        }

        await session.save();

        // Notify if high stress
        if (stressAnalysis.requiresAlert) {
          this.notifyMedicalTeam(patientId, stressAnalysis, message);
        }
      }

      res.json({
        success: true,
        response,
        sessionId: session?.sessionId || 'test-session',
        stressAnalysis,
        sources: ragResult.sources,
        contextUsed: ragResult.contextUsed,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Chatbot Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async streamChat(req, res) {
    // SSE streaming implementation
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Implementation similar to chat but with streaming
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }

  async scanPrescription(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Image requise' });
      }

      const ocrResult = await ocrService.scanPrescription(req.file.buffer);

      if (!ocrResult.isValidPrescription.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Ordonnance non valide',
          details: ocrResult.isValidPrescription.checks
        });
      }

      // Structure with Groq
      const prompt = `Analyse cette ordonnance et retourne UNIQUEMENT du JSON valide:
      ${ocrResult.rawText}

      Format: {
        "patientName": "...",
        "doctorName": "...",
        "date": "...",
        "medications": [{"name": "...", "dosage": "...", "frequency": "..."}]
      }`;

      const structured = await groqService.askGroq([
        { role: 'system', content: 'Tu es un pharmacien. Retourne UNIQUEMENT du JSON valide.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.3 });

      let parsedData;
      try {
        parsedData = JSON.parse(structured);
      } catch (e) {
        parsedData = ocrResult.extractedData;
      }

      res.json({
        success: true,
        ocr: {
          rawText: ocrResult.rawText,
          confidence: ocrResult.confidence
        },
        structured: parsedData,
        warnings: this.generateWarnings(parsedData),
        nextSteps: [
          "Vérifiez avec votre pharmacien",
          "Notez les heures de prise",
          "Signalez les effets secondaires"
        ]
      });

    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getHistory(req, res) {
    try {
      const { patientId } = req.params;
      const { limit = 20, page = 1 } = req.query;

      const history = await ChatHistory.find({ patientId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      res.json({
        success: true,
        total: await ChatHistory.countDocuments({ patientId }),
        page: parseInt(page),
        data: history.map(h => ({
          sessionId: h.sessionId,
          date: h.createdAt,
          messageCount: h.messages.length,
          stressPeaks: h.metadata.stressPeaks
        }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSessionDetails(req, res) {
    try {
      const { sessionId } = req.params;
      const session = await ChatHistory.findOne({ sessionId });

      if (!session) {
        return res.status(404).json({ error: 'Session non trouvée' });
      }

      res.json({
        success: true,
        session: {
          id: session.sessionId,
          messages: session.messages,
          stressPeaks: session.metadata.stressPeaks
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStats(req, res) {
    try {
      const { patientId } = req.params;
      const sessions = await ChatHistory.find({ patientId });

      const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);
      const stressScores = sessions.flatMap(s =>
        s.messages.filter(m => m.stressAnalysis?.detected).map(m => m.stressAnalysis.score)
      );

      res.json({
        success: true,
        stats: {
          totalSessions: sessions.length,
          totalMessages,
          averageStressScore: stressScores.length > 0
            ? Math.round(stressScores.reduce((a, b) => a + b, 0) / stressScores.length)
            : 0,
          lastActivity: sessions[0]?.updatedAt || null
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Doctor dashboard methods
  async getAlerts(req, res) {
    try {
      const { severity, status, viewed } = req.query;

      // Get recent sessions with high stress
      const query = { 'messages.stressAnalysis.requiresAlert': true };

      const sessions = await ChatHistory.find(query)
        .populate('patientId', 'firstName lastName email')
        .sort({ 'messages.timestamp': -1 })
        .limit(50);

      const alerts = [];
      for (const s of sessions) {
        const patient = s.patientId;
        if (patient) {
          const stressMessages = s.messages.filter(m => m.stressAnalysis?.requiresAlert);
          for (const m of stressMessages) {
            alerts.push({
              _id: `${s.sessionId}_${m.timestamp.getTime()}`,
              patientId: s.patientId._id,
              patientName: `${patient.firstName} ${patient.lastName}`,
              type: 'stress',
              severity: m.stressAnalysis.intensity === 'high' ? 'high' : 'medium',
              message: m.content.substring(0, 100),
              status: 'new',
              createdAt: m.timestamp,
              patient: {
                _id: patient._id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                email: patient.email
              }
            });
          }
        }
      }

      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async markAlertAsViewed(req, res) {
    res.json({ success: true, message: 'Alert marked as viewed' });
  }

  async handleAlert(req, res) {
    res.json({ success: true, message: 'Alert handled' });
  }

  async resolveAlert(req, res) {
    res.json({ success: true, message: 'Alert resolved' });
  }

  async getPatientReport(req, res) {
    try {
      const { patientId } = req.params;
      const sessions = await ChatHistory.find({ patientId });

      const stressScores = sessions.flatMap(s =>
        s.messages.filter(m => m.stressAnalysis?.detected).map(m => m.stressAnalysis.score)
      );

      res.json({
        patientId,
        patientName: 'Patient', // Get from Patient model
        totalSessions: sessions.length,
        averageStressScore: stressScores.length > 0
          ? Math.round(stressScores.reduce((a, b) => a + b, 0) / stressScores.length)
          : 0,
        stressTrend: 'stable',
        lastActivity: sessions[0]?.updatedAt || null,
        recommendations: [],
        alerts: []
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async uploadKnowledge(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Fichier requis' });
      }

      const extracted = await ocrService.processFile(req.file.buffer, req.file.mimetype);

      const docId = await ragService.addDocument(
        req.body.title || req.file.originalname,
        extracted.text,
        {
          category: req.body.category || 'general',
          tags: (req.body.tags || '').split(',').map(t => t.trim()),
          uploadedBy: req.user?.id
        }
      );

      res.json({
        success: true,
        documentId: docId,
        extractedLength: extracted.text.length,
        preview: extracted.text.substring(0, 500)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  buildSystemMessage = (stressAnalysis, ragResult) => {
    let msg = `Tu es Dr. Sara, l'assistant IA spécialisé en oncologie et santé pour CancerCare. Tu es un assistant médical virtuel empathique et compétent.

RÔLE PRINCIPAL:
- Répondre à toutes les questions des patients sur le cancer, les traitements, la santé, et les préoccupations générales
- Fournir des informations médicales générales basées sur des connaissances validées
- Être empathique, rassurant et professionnel
- Orienter vers des professionnels de santé quand nécessaire

CAPACITÉS:
- Répondre à des questions sur les symptômes, traitements, effets secondaires
- Expliquer des termes médicaux complexes en langage simple
- Donner des conseils sur la gestion du stress et du bien-être
- Répondre à des questions générales sur la santé et la prévention
- Utiliser les connaissances médicales disponibles pour enrichir les réponses

LIMITES IMPORTANTES:
- Ne jamais donner de diagnostic définitif
- Ne jamais prescrire de médicaments ou modifier des traitements
- Toujours recommander de consulter un médecin pour des conseils personnalisés
- Si la question est urgente ou grave, diriger immédiatement vers les urgences`;

    if (stressAnalysis.detected) {
      msg += `\n\n⚠️ DÉTECTION DE STRESS: Le patient semble stressé (score: ${stressAnalysis.score}/100). Sois particulièrement empathique, rassurant et propose des techniques de relaxation.`;
    }

    if (ragResult.contextUsed) {
      msg += `\n\nCONTEXTE DISPONIBLE: ${ragResult.sources.length} documents médicaux pertinents ont été consultés pour enrichir la réponse.`;
    }

    msg += `\n\nSTYLE DE RÉPONSE:
- Utilise un ton chaleureux et rassurant
- Structure les réponses clairement (introduction, explication, conclusion)
- Utilise des émojis appropriés pour rendre les messages plus accessibles
- Termine par une question ouverte pour encourager le dialogue
- Si besoin, propose des ressources supplémentaires`;

    return msg;
  }

  generateWarnings(data) {
    const warnings = [];
    const criticalMeds = ['anticoagulant', 'chimiothérapie', 'immunosuppresseur'];

    data.medications?.forEach(med => {
      if (criticalMeds.some(c => med.name?.toLowerCase().includes(c))) {
        warnings.push(`${med.name} nécessite surveillance`);
      }
    });

    return warnings;
  }

  notifyMedicalTeam(patientId, stressAnalysis, message) {
    console.log(`🚨 ALERTE: Patient ${patientId} - Stress ${stressAnalysis.score}%`);
  }
}

module.exports = new ChatbotController();