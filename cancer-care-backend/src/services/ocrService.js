const Tesseract = require('tesseract.js');

let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.warn('Sharp module not available, OCR preprocessing disabled:', error.message);
  sharp = null;
}

class OCRService {
  constructor() {
    this.patterns = {
      medication: /(\w+(?:\s+\w+)*)\s+(\d+(?:\s*mg|g|ml|mcg))/gi,
      date: /\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}/g,
      doctor: /Dr\.?\s+([A-Z][a-z]+)/i
    };
  }

  async preprocess(buffer) {
    if (!sharp) {
      console.log('Sharp not available, skipping preprocessing');
      return buffer;
    }
    return sharp(buffer)
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();
  }

  async scanPrescription(imageBuffer) {
    const processed = await this.preprocess(imageBuffer);
    
    const result = await Tesseract.recognize(processed, 'fra+eng', {
      logger: m => console.log(m.status === 'recognizing text' ? `${(m.progress * 100).toFixed(0)}%` : '')
    });

    const text = result.data.text;
    const data = this.extractData(text);

    return {
      success: true,
      rawText: text,
      confidence: result.data.confidence,
      extractedData: data,
      isValidPrescription: {
        isValid: data.medications.length > 0,
        checks: {
          hasMedications: data.medications.length > 0,
          hasDoctor: !!data.doctorName,
          hasDate: !!data.date,
          medicationCount: data.medications.length
        }
      }
    };
  }

  extractData(text) {
    const medications = [];
    let m;
    while ((m = this.patterns.medication.exec(text)) !== null) {
      medications.push({ name: m[1].trim(), dosage: m[2].trim() });
    }

    return {
      medications,
      date: text.match(this.patterns.date)?.[0] || null,
      doctorName: text.match(this.patterns.doctor)?.[1] || null,
      fullText: text
    };
  }

  async processFile(buffer, mimetype) {
    if (mimetype.startsWith('image/')) {
      return this.scanPrescription(buffer);
    }
    throw new Error('Type non supporté: ' + mimetype);
  }
}

module.exports = new OCRService();