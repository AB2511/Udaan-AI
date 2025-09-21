import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { fileTypeFromBuffer } from 'file-type';

class ResumeParsingService {
  constructor() {
    this.skillCategories = {
      technical: {
        programming: ['javascript', 'python', 'java', 'react', 'node.js', 'html', 'css'],
        databases: ['mysql', 'postgresql', 'mongodb', 'redis'],
        cloud: ['aws', 'azure', 'docker', 'kubernetes'],
        tools: ['git', 'github', 'jira']
      },
      soft: ['leadership', 'communication', 'teamwork', 'problem solving']
    };

    this.experiencePatterns = {
      titles: ['software engineer', 'developer', 'manager', 'analyst'],
      companies: /(?:at|@)\s+([A-Z][a-zA-Z\s&.,]+)/gi,
      duration: /(\d{1,2}\/\d{4}|\w+\s+\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|\w+\s+\d{4}|present|current)/gi
    };

    this.educationPatterns = {
      degrees: ['bachelor', 'master', 'phd', 'b.s.', 'b.a.', 'm.s.', 'm.a.', 'mba'],
      institutions: /(?:university|college|institute)\s+of\s+[a-zA-Z\s]+|[a-zA-Z\s]+\s+(?:university|college|institute)/gi
    };
  }

  async extractText(fileBuffer, mimeType) {
    try {
      let rawText = '';
      
      if (mimeType === 'application/pdf') {
        const data = await pdfParse(fileBuffer);
        rawText = data.text;
      } else if (mimeType.includes('wordprocessingml') || mimeType === 'application/msword') {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        rawText = result.value;
      } else if (mimeType === 'text/plain') {
        rawText = fileBuffer.toString('utf8');
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }
      
      // Clean and preprocess the extracted text
      const cleanText = this.preprocessText(rawText);
      
      // Validate the extracted text
      this.validateExtractedText(cleanText);
      
      return cleanText;
    } catch (error) {
      throw new Error(`Text extraction failed: ${error.message}`);
    }
  }

  preprocessText(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return '';
    }

    let cleanText = rawText;

    // Remove excessive whitespace and normalize line breaks
    cleanText = cleanText.replace(/\r\n/g, '\n');
    cleanText = cleanText.replace(/\r/g, '\n');
    cleanText = cleanText.replace(/\n{3,}/g, '\n\n');
    cleanText = cleanText.replace(/[ \t]{2,}/g, ' ');

    // Remove common PDF artifacts and special characters
    cleanText = cleanText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    cleanText = cleanText.replace(/[^\x20-\x7E\n]/g, ' ');

    // Remove page numbers and headers/footers patterns
    cleanText = cleanText.replace(/^Page \d+ of \d+$/gm, '');
    cleanText = cleanText.replace(/^\d+$/gm, '');

    // Clean up bullet points and special formatting
    cleanText = cleanText.replace(/[•·▪▫◦‣⁃]/g, '•');
    cleanText = cleanText.replace(/^\s*[•\-\*]\s*/gm, '• ');

    // Remove excessive spaces around punctuation
    cleanText = cleanText.replace(/\s+([,.;:!?])/g, '$1');
    cleanText = cleanText.replace(/([,.;:!?])\s+/g, '$1 ');

    // Normalize email and phone patterns for better parsing
    cleanText = cleanText.replace(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, ' $1 ');
    cleanText = cleanText.replace(/\b(\+?[\d\s\-\(\)]{10,})\b/g, ' $1 ');

    // Final cleanup
    cleanText = cleanText.trim();
    cleanText = cleanText.replace(/\n\s*\n/g, '\n\n');
    cleanText = cleanText.replace(/[ \t]+/g, ' ');

    return cleanText;
  }

  validateExtractedText(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('No valid text content extracted from file');
    }

    if (text.trim().length === 0) {
      throw new Error('Extracted text is empty or contains only whitespace');
    }

    if (text.length < 50) {
      throw new Error('Extracted text is too short to be a valid resume (minimum 50 characters)');
    }

    if (text.length > 100000) {
      throw new Error('Extracted text is too long (maximum 100,000 characters)');
    }

    // Check for minimum content indicators
    const hasLetters = /[a-zA-Z]/.test(text);
    if (!hasLetters) {
      throw new Error('Extracted text does not contain readable content');
    }

    // Check for reasonable word count
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < 20) {
      throw new Error('Extracted text has insufficient word count for a resume (minimum 20 words)');
    }

    return true;
  }

  identifySkills(text) {
    const normalizedText = text.toLowerCase();
    const identifiedSkills = {
      technical: { programming: [], databases: [], cloud: [], tools: [] },
      soft: []
    };

    Object.keys(this.skillCategories.technical).forEach(category => {
      this.skillCategories.technical[category].forEach(skill => {
        const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        if (skillRegex.test(normalizedText)) {
          identifiedSkills.technical[category].push(skill);
        }
      });
    });

    this.skillCategories.soft.forEach(skill => {
      const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (skillRegex.test(normalizedText)) {
        identifiedSkills.soft.push(skill);
      }
    });

    Object.keys(identifiedSkills.technical).forEach(category => {
      identifiedSkills.technical[category] = [...new Set(identifiedSkills.technical[category])];
    });
    identifiedSkills.soft = [...new Set(identifiedSkills.soft)];

    return identifiedSkills;
  }

  parseExperience(text) {
    const experiences = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentExperience = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      const hasJobTitle = this.experiencePatterns.titles.some(title => 
        lowerLine.includes(title.toLowerCase())
      );
      
      const companyMatch = line.match(this.experiencePatterns.companies);
      const durationMatch = line.match(this.experiencePatterns.duration);
      
      if (hasJobTitle || companyMatch) {
        if (currentExperience) {
          experiences.push(currentExperience);
        }
        
        currentExperience = {
          role: hasJobTitle ? line : '',
          company: companyMatch ? companyMatch[0].replace(/^(at|@)\s+/i, '') : '',
          duration: '',
          skills: []
        };
      } else if (durationMatch && currentExperience) {
        currentExperience.duration = durationMatch[0];
      } else if (currentExperience && line.length > 10) {
        const skillsInLine = this.identifySkills(line);
        Object.values(skillsInLine.technical).forEach(categorySkills => {
          currentExperience.skills.push(...categorySkills);
        });
        currentExperience.skills.push(...skillsInLine.soft);
      }
    }
    
    if (currentExperience) {
      experiences.push(currentExperience);
    }
    
    experiences.forEach(exp => {
      exp.skills = [...new Set(exp.skills)];
    });
    
    return experiences;
  }

  parseEducation(text) {
    const education = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      const hasDegree = this.educationPatterns.degrees.some(degree => 
        lowerLine.includes(degree.toLowerCase())
      );
      
      const institutionMatch = line.match(this.educationPatterns.institutions);
      
      if (hasDegree || institutionMatch) {
        const educationEntry = {
          degree: hasDegree ? line : '',
          institution: institutionMatch ? institutionMatch[0] : '',
          year: null
        };
        
        const yearPattern = /\b(19|20)\d{2}\b/g;
        const yearMatch = line.match(yearPattern);
        if (yearMatch) {
          educationEntry.year = parseInt(yearMatch[yearMatch.length - 1]);
        }
        
        education.push(educationEntry);
      }
    }
    
    return education;
  }

  async parseResume(fileBuffer, mimeType) {
    try {
      // Extract and clean text
      const resumeText = await this.extractText(fileBuffer, mimeType);
      
      // Parse different sections
      const skills = this.identifySkills(resumeText);
      const experience = this.parseExperience(resumeText);
      const education = this.parseEducation(resumeText);
      const contactInfo = this.extractContactInfo(resumeText);
      const textQuality = this.calculateTextQuality(resumeText);
      
      const allSkills = [
        ...Object.values(skills.technical).flat(),
        ...skills.soft
      ];
      
      return {
        resumeText: resumeText.substring(0, 5000), // Limit stored text for performance
        fullTextLength: resumeText.length,
        extractedSkills: allSkills,
        experience,
        education,
        contactInfo,
        skillCategories: skills,
        textQuality,
        metadata: {
          textLength: resumeText.length,
          experienceCount: experience.length,
          educationCount: education.length,
          skillCount: allSkills.length,
          qualityScore: textQuality.score,
          extractionTimestamp: new Date().toISOString(),
          processingVersion: '2.0'
        }
      };
    } catch (error) {
      throw new Error(`Resume parsing failed: ${error.message}`);
    }
  }

  async validateFile(fileBuffer, originalName) {
    try {
      // Basic input validation
      if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
        throw new Error('Invalid file buffer provided');
      }

      if (!originalName || typeof originalName !== 'string') {
        throw new Error('Invalid file name provided');
      }

      if (fileBuffer.length === 0) {
        throw new Error('File is empty');
      }

      // File size validation
      const minSize = 100; // 100 bytes minimum
      const maxSize = 10 * 1024 * 1024; // 10MB maximum
      
      if (fileBuffer.length < minSize) {
        throw new Error(`File is too small. Minimum size is ${minSize} bytes.`);
      }

      if (fileBuffer.length > maxSize) {
        throw new Error(`File size too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`);
      }

      // File type detection and validation
      const fileType = await fileTypeFromBuffer(fileBuffer);
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      
      const detectedMimeType = fileType?.mime;
      const isValidType = allowedTypes.includes(detectedMimeType);
      
      // Extension validation
      const extension = originalName.toLowerCase().split('.').pop();
      const validExtensions = ['pdf', 'doc', 'docx'];
      const hasValidExtension = validExtensions.includes(extension);
      
      // File name validation
      if (originalName.length > 255) {
        throw new Error('File name is too long (maximum 255 characters)');
      }

      const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
      if (invalidChars.test(originalName)) {
        throw new Error('File name contains invalid characters');
      }

      // Type validation with better error messages
      if (!isValidType && !hasValidExtension) {
        throw new Error(`Invalid file type. Only PDF (.pdf), Word (.doc), and Word (.docx) files are supported. Detected type: ${detectedMimeType || 'unknown'}`);
      }

      // Warn about type mismatch but allow if extension is valid
      let finalMimeType = detectedMimeType || this.getMimeTypeFromExtension(extension);
      
      if (detectedMimeType && !isValidType && hasValidExtension) {
        console.warn(`File type mismatch: detected ${detectedMimeType} but extension suggests ${extension}`);
        finalMimeType = this.getMimeTypeFromExtension(extension);
      }

      // Additional PDF validation
      if (finalMimeType === 'application/pdf') {
        if (!fileBuffer.toString('ascii', 0, 4).includes('%PDF')) {
          throw new Error('File appears to be corrupted or is not a valid PDF');
        }
      }

      return {
        isValid: true,
        mimeType: finalMimeType,
        size: fileBuffer.length,
        extension,
        detectedMimeType,
        sizeInMB: Math.round((fileBuffer.length / (1024 * 1024)) * 100) / 100
      };
    } catch (error) {
      throw new Error(`File validation failed: ${error.message}`);
    }
  }

  getMimeTypeFromExtension(extension) {
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  // Additional utility methods for enhanced text processing
  extractContactInfo(text) {
    const contactInfo = {
      emails: [],
      phones: [],
      linkedIn: null,
      github: null
    };

    // Extract emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex) || [];
    contactInfo.emails = [...new Set(emails)];

    // Extract phone numbers
    const phoneRegex = /(\+?[\d\s\-\(\)]{10,})/g;
    const phones = text.match(phoneRegex) || [];
    contactInfo.phones = [...new Set(phones.map(phone => phone.replace(/\s+/g, ' ').trim()))];

    // Extract LinkedIn profile
    const linkedInRegex = /(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([\w\-]+)/i;
    const linkedInMatch = text.match(linkedInRegex);
    if (linkedInMatch) {
      contactInfo.linkedIn = `https://linkedin.com/in/${linkedInMatch[1]}`;
    }

    // Extract GitHub profile
    const githubRegex = /(?:github\.com\/)([\w\-]+)/i;
    const githubMatch = text.match(githubRegex);
    if (githubMatch) {
      contactInfo.github = `https://github.com/${githubMatch[1]}`;
    }

    return contactInfo;
  }

  calculateTextQuality(text) {
    if (!text || typeof text !== 'string') {
      return { score: 0, issues: ['No text provided'] };
    }

    const issues = [];
    let score = 100;

    // Check text length
    if (text.length < 500) {
      issues.push('Text is quite short for a resume');
      score -= 20;
    }

    // Check for reasonable sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length < 5) {
      issues.push('Very few complete sentences detected');
      score -= 15;
    }

    // Check for common resume sections
    const commonSections = ['experience', 'education', 'skills', 'work', 'employment'];
    const foundSections = commonSections.filter(section => 
      new RegExp(section, 'i').test(text)
    );
    
    if (foundSections.length < 2) {
      issues.push('Missing common resume sections');
      score -= 25;
    }

    // Check for excessive special characters or formatting artifacts
    const specialCharRatio = (text.match(/[^\w\s.,;:!?()\-]/g) || []).length / text.length;
    if (specialCharRatio > 0.1) {
      issues.push('High ratio of special characters (possible formatting issues)');
      score -= 10;
    }

    // Check for repeated patterns (OCR errors)
    const repeatedPatterns = text.match(/(.{3,})\1{2,}/g);
    if (repeatedPatterns && repeatedPatterns.length > 3) {
      issues.push('Repeated text patterns detected (possible OCR errors)');
      score -= 15;
    }

    return {
      score: Math.max(0, score),
      issues: issues.length > 0 ? issues : ['Text quality appears good'],
      wordCount: text.split(/\s+/).length,
      characterCount: text.length,
      sectionsFound: foundSections
    };
  }
}

export default ResumeParsingService;