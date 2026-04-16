// Version avec fallback si ChromaDB n'est pas disponible
let ChromaClient;
try {
  ChromaClient = require('chromadb').ChromaClient;
} catch (e) {
  console.warn('⚠️ ChromaDB not installed, using in-memory fallback');
}

const { pipeline } = require('@xenova/transformers');

class RAGService {
  constructor() {
    this.client = null;
    this.collection = null;
    this.embeddingModel = null;
    this.isInitialized = false;
    this.inMemoryDocs = []; // Fallback
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Try ChromaDB first
      if (ChromaClient) {
        this.client = new ChromaClient({
          path: process.env.CHROMADB_URL || 'http://localhost:8000'
        });

        this.collection = await this.client.getOrCreateCollection({
          name: 'cancercare_knowledge',
          metadata: { 'hnsw:space': 'cosine' }
        });
        console.log('✅ ChromaDB connected');
      } else {
        console.log('⚠️ Using in-memory fallback for RAG');
      }

      // Load embedding model
      console.log('Loading embedding model...');
      this.embeddingModel = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );

      this.isInitialized = true;
      console.log('✅ RAG Service ready');
    } catch (error) {
      console.error('❌ RAG init error:', error.message);
      // Continue with limited functionality
      this.isInitialized = true;
    }
  }

  async generateEmbedding(text) {
    if (!this.isInitialized) await this.initialize();
    
    if (!this.embeddingModel) {
      // Return random embedding as fallback
      return Array(384).fill(0).map(() => Math.random());
    }
    
    const output = await this.embeddingModel(text, {
      pooling: 'mean',
      normalize: true
    });
    
    return Array.from(output.data);
  }

  async addDocument(title, content, metadata = {}) {
    if (!this.isInitialized) await this.initialize();

    const embedding = await this.generateEmbedding(content);
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (this.collection) {
      // Use ChromaDB
      await this.collection.add({
        ids: [id],
        embeddings: [embedding],
        documents: [content],
        metadatas: [{ title, category: metadata.category || 'general', ...metadata }]
      });
    } else {
      // Fallback: store in memory
      this.inMemoryDocs.push({
        id,
        content,
        embedding,
        metadata: { title, ...metadata }
      });
    }

    return id;
  }

  async searchSimilar(query, nResults = 5) {
    if (!this.isInitialized) await this.initialize();

    const queryEmbedding = await this.generateEmbedding(query);

    if (this.collection) {
      // Use ChromaDB
      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults,
        include: ['documents', 'metadatas', 'distances']
      });

      return results.documents[0].map((doc, i) => ({
        content: doc,
        metadata: results.metadatas[0][i],
        similarity: 1 - results.distances[0][i],
        documentId: results.ids[0][i]
      })).filter(r => r.similarity > 0.7);
    } else {
      // Fallback: simple cosine similarity on in-memory docs
      const similarities = this.inMemoryDocs.map(doc => ({
        ...doc,
        similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
      }));
      
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, nResults)
        .filter(r => r.similarity > 0.5);
    }
  }

  cosineSimilarity(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async enhanceQueryWithContext(query, history = []) {
    const relevantDocs = await this.searchSimilar(query);
    
    if (relevantDocs.length === 0) {
      return { enhancedQuery: query, contextUsed: false, sources: [] };
    }

    const context = relevantDocs
      .map((d, i) => `[Source ${i+1}] ${d.metadata?.title || 'Doc'}:\n${d.content?.substring(0, 500) || ''}`)
      .join('\n\n');

    return {
      enhancedQuery: `Basé sur:\n${context}\n\nQuestion: ${query}`,
      contextUsed: true,
      sources: relevantDocs
    };
  }
}

module.exports = new RAGService();