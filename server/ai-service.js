import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'mock';
    this.initializeProvider();
    console.log(`🤖 AI Service initialized with provider: ${this.provider}`);
  }

  initializeProvider() {
    switch (this.provider) {
      case 'openai':
        if (process.env.OPENAI_API_KEY) {
          this.openaiConfig = {
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            baseURL: 'https://api.openai.com/v1'
          };
          console.log('🔑 OpenAI configured');
        } else {
          console.warn('⚠️  OpenAI API key not found, falling back to mock');
          this.provider = 'mock';
        }
        break;
      
      case 'huggingface':
        if (process.env.HUGGINGFACE_API_KEY) {
          this.huggingfaceConfig = {
            apiKey: process.env.HUGGINGFACE_API_KEY,
            model: process.env.HUGGINGFACE_MODEL || 'microsoft/DialoGPT-large',
            baseURL: 'https://api-inference.huggingface.co'
          };
          console.log('🤗 Hugging Face configured');
        } else {
          console.warn('⚠️  Hugging Face API key not found, falling back to mock');
          this.provider = 'mock';
        }
        break;
      
      case 'anthropic':
        if (process.env.ANTHROPIC_API_KEY) {
          this.anthropicConfig = {
            apiKey: process.env.ANTHROPIC_API_KEY,
            model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
            baseURL: 'https://api.anthropic.com'
          };
          console.log('🧠 Anthropic Claude configured');
        } else {
          console.warn('⚠️  Anthropic API key not found, falling back to mock');
          this.provider = 'mock';
        }
        break;
      
      default:
        this.provider = 'mock';
        console.log('🎭 Using mock AI service');
    }
  }

  async generateStudyPlan(userProfile) {
    try {
      console.log('📚 Generating study plan for user profile:', userProfile);
      
      switch (this.provider) {
        case 'openai':
          return await this.generateStudyPlanOpenAI(userProfile);
        case 'anthropic':
          return await this.generateStudyPlanAnthropic(userProfile);
        default:
          return this.generateMockStudyPlan(userProfile);
      }
    } catch (error) {
      console.error('AI service error, falling back to mock:', error);
      return this.generateMockStudyPlan(userProfile);
    }
  }

  async generateStudyPlanOpenAI(userProfile) {
    const prompt = `Create a personalized study plan for a ${userProfile.category} student studying ${userProfile.domain || userProfile.branch}. 
    Current GPA: ${userProfile.currentGpa}, Target GPA: ${userProfile.expectedGpa}
    Current study hours: ${userProfile.currentStudyHours}, Target study hours: ${userProfile.expectedStudyHours}
    Self-rating: ${userProfile.currentSelfRating}/10, Target: ${userProfile.expectedSelfRating}/10
    
    Generate 5-7 specific study tasks with titles, descriptions, durations, priorities (high/medium/low), and categories.
    Return as JSON array with format: [{"id": "1", "title": "...", "description": "...", "duration": "...", "priority": "...", "category": "...", "completed": false}]`;

    try {
      const response = await axios.post(
        `${this.openaiConfig.baseURL}/chat/completions`,
        {
          model: this.openaiConfig.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.generateMockStudyPlan(userProfile);
    }
  }

  async generateStudyPlanAnthropic(userProfile) {
    const prompt = `Create a personalized study plan for a ${userProfile.category} student studying ${userProfile.domain || userProfile.branch}. 
    Current GPA: ${userProfile.currentGpa}, Target GPA: ${userProfile.expectedGpa}
    Current study hours: ${userProfile.currentStudyHours}, Target study hours: ${userProfile.expectedStudyHours}
    Self-rating: ${userProfile.currentSelfRating}/10, Target: ${userProfile.expectedSelfRating}/10
    
    Generate 5-7 specific study tasks with titles, descriptions, durations, priorities (high/medium/low), and categories.
    Return as JSON array with format: [{"id": "1", "title": "...", "description": "...", "duration": "...", "priority": "...", "category": "...", "completed": false}]`;

    try {
      const response = await axios.post(
        `${this.anthropicConfig.baseURL}/v1/messages`,
        {
          model: this.anthropicConfig.model,
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }]
        },
        {
          headers: {
            'x-api-key': this.anthropicConfig.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          }
        }
      );

      return JSON.parse(response.data.content[0].text);
    } catch (error) {
      console.error('Anthropic API error:', error);
      return this.generateMockStudyPlan(userProfile);
    }
  }

  generateMockStudyPlan(userProfile) {
    console.log('🎭 Generating mock study plan...');
    
    const basePlan = [
      {
        id: '1',
        title: 'Morning Review Session',
        description: 'Review previous day\'s concepts and prepare for new topics',
        duration: '30 minutes',
        priority: 'high',
        category: 'Review',
        completed: false
      },
      {
        id: '2',
        title: `Core ${userProfile.domain || userProfile.branch || 'Subject'} Study`,
        description: `Deep dive into ${userProfile.domain || userProfile.branch || 'main subject'} areas with focused learning`,
        duration: '2 hours',
        priority: 'high',
        category: 'Study',
        completed: false
      },
      {
        id: '3',
        title: 'Practice Problems',
        description: 'Solve practice questions and work on problem-solving skills',
        duration: '1 hour',
        priority: 'medium',
        category: 'Practice',
        completed: false
      },
      {
        id: '4',
        title: 'Flashcard Review',
        description: 'Review flashcards using spaced repetition technique',
        duration: '20 minutes',
        priority: 'medium',
        category: 'Review',
        completed: false
      },
      {
        id: '5',
        title: 'Note Taking & Organization',
        description: 'Organize and summarize today\'s learning materials',
        duration: '30 minutes',
        priority: 'low',
        category: 'Organization',
        completed: false
      }
    ];

    // Customize based on user profile
    if (userProfile.expectedStudyHours > userProfile.currentStudyHours) {
      basePlan.push({
        id: '6',
        title: 'Extended Study Session',
        description: 'Additional focused study time to reach your target hours',
        duration: `${Math.round((userProfile.expectedStudyHours - userProfile.currentStudyHours) * 60)} minutes`,
        priority: 'medium',
        category: 'Study',
        completed: false
      });
    }

    if (userProfile.expectedGpa > userProfile.currentGpa) {
      basePlan.push({
        id: '7',
        title: 'Performance Improvement Focus',
        description: 'Targeted study on weak areas to improve GPA',
        duration: '45 minutes',
        priority: 'high',
        category: 'Improvement',
        completed: false
      });
    }

    console.log(`✅ Generated ${basePlan.length} study plan items`);
    return basePlan;
  }

  async summarizeText(text, options = {}) {
    try {
      console.log('📝 Summarizing text...');
      
      switch (this.provider) {
        case 'openai':
          return await this.summarizeTextOpenAI(text, options);
        case 'anthropic':
          return await this.summarizeTextAnthropic(text, options);
        default:
          return this.generateMockSummary(text, options);
      }
    } catch (error) {
      console.error('AI summarization error, falling back to mock:', error);
      return this.generateMockSummary(text, options);
    }
  }

  async summarizeTextOpenAI(text, options) {
    const lengthInstruction = {
      'short': 'in 2-3 sentences',
      'medium': 'in 1-2 paragraphs',
      'long': 'in 3-4 paragraphs'
    }[options.length] || 'in 1-2 paragraphs';

    const prompt = `Summarize the following text ${lengthInstruction}. Also extract 3-5 key points as bullet points.

Text: ${text}

Format your response as JSON:
{
  "summary": "...",
  "keyPoints": ["point 1", "point 2", ...]
}`;

    try {
      const response = await axios.post(
        `${this.openaiConfig.baseURL}/chat/completions`,
        {
          model: this.openaiConfig.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      return this.formatSummaryResult(text, result.summary, result.keyPoints);
    } catch (error) {
      console.error('OpenAI summarization error:', error);
      return this.generateMockSummary(text, options);
    }
  }

  async summarizeTextAnthropic(text, options) {
    const lengthInstruction = {
      'short': 'in 2-3 sentences',
      'medium': 'in 1-2 paragraphs',
      'long': 'in 3-4 paragraphs'
    }[options.length] || 'in 1-2 paragraphs';

    const prompt = `Summarize the following text ${lengthInstruction}. Also extract 3-5 key points as bullet points.

Text: ${text}

Format your response as JSON:
{
  "summary": "...",
  "keyPoints": ["point 1", "point 2", ...]
}`;

    try {
      const response = await axios.post(
        `${this.anthropicConfig.baseURL}/v1/messages`,
        {
          model: this.anthropicConfig.model,
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        },
        {
          headers: {
            'x-api-key': this.anthropicConfig.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          }
        }
      );

      const result = JSON.parse(response.data.content[0].text);
      return this.formatSummaryResult(text, result.summary, result.keyPoints);
    } catch (error) {
      console.error('Anthropic summarization error:', error);
      return this.generateMockSummary(text, options);
    }
  }

  generateMockSummary(text, options) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordCount = text.split(/\s+/).length;
    
    let summaryLength;
    switch (options.length) {
      case 'short': summaryLength = Math.max(1, Math.floor(sentences.length * 0.25)); break;
      case 'medium': summaryLength = Math.max(1, Math.floor(sentences.length * 0.5)); break;
      case 'long': summaryLength = Math.max(1, Math.floor(sentences.length * 0.75)); break;
      default: summaryLength = Math.max(1, Math.floor(sentences.length * 0.5));
    }

    const summarySentences = sentences.slice(0, summaryLength);
    const summary = summarySentences.join('. ') + '.';
    
    const paragraphs = text.split(/\n\s*\n/);
    const keyPoints = paragraphs
      .map(p => p.split(/[.!?]/)[0].trim())
      .filter(point => point.length > 20)
      .slice(0, 5);

    return this.formatSummaryResult(text, summary, keyPoints);
  }

  formatSummaryResult(originalText, summary, keyPoints) {
    const originalWordCount = originalText.split(/\s+/).length;
    const summaryWordCount = summary.split(/\s+/).length;
    
    return {
      originalText,
      summary,
      keyPoints,
      wordCount: {
        original: originalWordCount,
        summary: summaryWordCount
      },
      readingTime: {
        original: Math.ceil(originalWordCount / 200),
        summary: Math.ceil(summaryWordCount / 200)
      }
    };
  }

  // 🚀 ENHANCED UNIVERSAL DOUBT SOLVER - ChatGPT-like capabilities
  async generateDoubtSolution(question, context = '') {
    try {
      console.log('🤔 Generating comprehensive solution for:', question.substring(0, 50) + '...');
      
      switch (this.provider) {
        case 'openai':
          return await this.generateDoubtSolutionOpenAI(question, context);
        case 'anthropic':
          return await this.generateDoubtSolutionAnthropic(question, context);
        case 'huggingface':
          return await this.generateDoubtSolutionHuggingFace(question, context);
        default:
          return this.generateAdvancedMockSolution(question, context);
      }
    } catch (error) {
      console.error('AI doubt solving error, falling back to advanced mock:', error);
      return this.generateAdvancedMockSolution(question, context);
    }
  }

  async generateDoubtSolutionOpenAI(question, context) {
    const systemPrompt = `You are an expert AI tutor with comprehensive knowledge across all academic subjects and real-world topics. You can help with:

📚 ACADEMIC SUBJECTS: Mathematics, Physics, Chemistry, Biology, Computer Science, Engineering, Literature, History, Geography, Economics, Psychology, Philosophy, etc.

🌍 GENERAL KNOWLEDGE: Science, Technology, Current Events, Arts, Culture, Languages, etc.

🛠️ PRACTICAL SKILLS: Programming, Problem-solving, Study techniques, Career advice, etc.

Provide detailed, accurate, and helpful responses with:
1. Clear explanations in simple language
2. Step-by-step solutions when applicable
3. Key concepts and principles
4. Practical examples and analogies
5. Additional learning resources or tips
6. Related topics for further exploration

Be encouraging, patient, and adapt your explanation level to the question complexity.`;

    const userPrompt = `Question: ${question}
${context ? `Additional Context: ${context}` : ''}

Please provide a comprehensive answer with:
- Clear explanation
- Step-by-step solution (if applicable)
- Key concepts involved
- Practical examples
- Study tips and additional resources

Format as JSON:
{
  "explanation": "Detailed explanation of the topic/solution",
  "steps": ["step 1", "step 2", "step 3", ...] (if applicable),
  "concepts": ["key concept 1", "key concept 2", ...],
  "examples": ["example 1", "example 2", ...] (if applicable),
  "tips": "Study tips and additional learning advice",
  "relatedTopics": ["related topic 1", "related topic 2", ...],
  "difficulty": "beginner|intermediate|advanced",
  "subject": "detected subject area"
}`;

    try {
      const response = await axios.post(
        `${this.openaiConfig.baseURL}/chat/completions`,
        {
          model: this.openaiConfig.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiConfig.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const result = JSON.parse(response.data.choices[0].message.content);
      console.log('✅ OpenAI solution generated successfully');
      return result;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.generateAdvancedMockSolution(question, context);
    }
  }

  async generateDoubtSolutionAnthropic(question, context) {
    const prompt = `You are an expert AI tutor. Help answer this question with a comprehensive explanation:

Question: ${question}
${context ? `Context: ${context}` : ''}

Provide a detailed response with explanation, steps (if applicable), key concepts, examples, and study tips.

Format as JSON:
{
  "explanation": "Detailed explanation",
  "steps": ["step 1", "step 2", ...] (if applicable),
  "concepts": ["concept 1", "concept 2", ...],
  "examples": ["example 1", "example 2", ...] (if applicable),
  "tips": "Study tips and advice",
  "relatedTopics": ["topic 1", "topic 2", ...],
  "difficulty": "beginner|intermediate|advanced",
  "subject": "detected subject area"
}`;

    try {
      const response = await axios.post(
        `${this.anthropicConfig.baseURL}/v1/messages`,
        {
          model: this.anthropicConfig.model,
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }]
        },
        {
          headers: {
            'x-api-key': this.anthropicConfig.apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          }
        }
      );

      const result = JSON.parse(response.data.content[0].text);
      console.log('✅ Anthropic solution generated successfully');
      return result;
    } catch (error) {
      console.error('Anthropic API error:', error);
      return this.generateAdvancedMockSolution(question, context);
    }
  }

  async generateDoubtSolutionHuggingFace(question, context) {
    const prompt = `Question: ${question}\n${context ? `Context: ${context}\n` : ''}Answer:`;

    try {
      const response = await axios.post(
        `${this.huggingfaceConfig.baseURL}/models/${this.huggingfaceConfig.model}`,
        {
          inputs: prompt,
          parameters: {
            max_length: 500,
            temperature: 0.7,
            do_sample: true
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceConfig.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const generatedText = response.data[0].generated_text.replace(prompt, '').trim();
      
      return {
        explanation: generatedText,
        steps: [],
        concepts: this.extractConcepts(question),
        examples: [],
        tips: "Practice similar problems to strengthen your understanding.",
        relatedTopics: [],
        difficulty: "intermediate",
        subject: this.detectSubject(question)
      };
    } catch (error) {
      console.error('Hugging Face API error:', error);
      return this.generateAdvancedMockSolution(question, context);
    }
  }

  generateAdvancedMockSolution(question, context) {
    console.log('🎭 Generating advanced mock solution...');
    
    const subject = this.detectSubject(question);
    const difficulty = this.detectDifficulty(question);
    const questionType = this.detectQuestionType(question);
    
    let explanation, steps, concepts, examples, tips, relatedTopics;

    // Generate contextual response based on detected subject and question type
    if (subject === 'Mathematics') {
      explanation = this.generateMathExplanation(question, questionType);
      steps = this.generateMathSteps(question, questionType);
      concepts = this.getMathConcepts(questionType);
      examples = this.getMathExamples(questionType);
    } else if (subject === 'Computer Science') {
      explanation = this.generateCSExplanation(question, questionType);
      steps = this.generateCSSteps(question, questionType);
      concepts = this.getCSConcepts(questionType);
      examples = this.getCSExamples(questionType);
    } else if (subject === 'Physics') {
      explanation = this.generatePhysicsExplanation(question, questionType);
      steps = this.generatePhysicsSteps(question, questionType);
      concepts = this.getPhysicsConcepts(questionType);
      examples = this.getPhysicsExamples(questionType);
    } else {
      // General response
      explanation = this.generateGeneralExplanation(question, context);
      steps = this.generateGeneralSteps(question);
      concepts = this.extractConcepts(question);
      examples = this.generateGeneralExamples(question);
    }

    tips = this.generateStudyTips(subject, difficulty);
    relatedTopics = this.generateRelatedTopics(subject, questionType);

    return {
      explanation,
      steps,
      concepts,
      examples,
      tips,
      relatedTopics,
      difficulty,
      subject
    };
  }

  detectSubject(question) {
    const mathKeywords = ['equation', 'solve', 'calculate', 'derivative', 'integral', 'matrix', 'algebra', 'geometry', 'trigonometry', 'calculus', 'statistics'];
    const csKeywords = ['algorithm', 'programming', 'code', 'function', 'variable', 'loop', 'array', 'object', 'class', 'database', 'software'];
    const physicsKeywords = ['force', 'energy', 'velocity', 'acceleration', 'momentum', 'wave', 'particle', 'quantum', 'thermodynamics', 'electricity'];
    const chemistryKeywords = ['molecule', 'atom', 'reaction', 'bond', 'element', 'compound', 'acid', 'base', 'organic', 'inorganic'];
    const biologyKeywords = ['cell', 'DNA', 'protein', 'organism', 'evolution', 'genetics', 'ecosystem', 'photosynthesis', 'respiration'];

    const lowerQuestion = question.toLowerCase();

    if (mathKeywords.some(keyword => lowerQuestion.includes(keyword))) return 'Mathematics';
    if (csKeywords.some(keyword => lowerQuestion.includes(keyword))) return 'Computer Science';
    if (physicsKeywords.some(keyword => lowerQuestion.includes(keyword))) return 'Physics';
    if (chemistryKeywords.some(keyword => lowerQuestion.includes(keyword))) return 'Chemistry';
    if (biologyKeywords.some(keyword => lowerQuestion.includes(keyword))) return 'Biology';

    return 'General';
  }

  detectDifficulty(question) {
    const advancedKeywords = ['advanced', 'complex', 'sophisticated', 'intricate', 'comprehensive'];
    const beginnerKeywords = ['basic', 'simple', 'introduction', 'beginner', 'fundamental'];

    const lowerQuestion = question.toLowerCase();

    if (advancedKeywords.some(keyword => lowerQuestion.includes(keyword))) return 'advanced';
    if (beginnerKeywords.some(keyword => lowerQuestion.includes(keyword))) return 'beginner';

    return 'intermediate';
  }

  detectQuestionType(question) {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('how') || lowerQuestion.includes('explain')) return 'explanation';
    if (lowerQuestion.includes('solve') || lowerQuestion.includes('calculate')) return 'problem-solving';
    if (lowerQuestion.includes('what is') || lowerQuestion.includes('define')) return 'definition';
    if (lowerQuestion.includes('compare') || lowerQuestion.includes('difference')) return 'comparison';
    if (lowerQuestion.includes('example') || lowerQuestion.includes('demonstrate')) return 'example';

    return 'general';
  }

  generateMathExplanation(question, type) {
    const explanations = {
      'problem-solving': `This is a mathematical problem that requires systematic approach. Let me break down the solution step by step, identifying the key mathematical concepts and applying appropriate formulas or methods.`,
      'definition': `This question asks for a mathematical definition. I'll provide a clear explanation of the concept, its properties, and how it relates to other mathematical ideas.`,
      'explanation': `This mathematical concept can be understood by examining its fundamental principles and seeing how it applies in various contexts.`
    };

    return explanations[type] || `This mathematical question involves analyzing the given information and applying relevant mathematical principles to find the solution.`;
  }

  generateMathSteps(question, type) {
    if (type === 'problem-solving') {
      return [
        "Identify the given information and what needs to be found",
        "Choose the appropriate mathematical method or formula",
        "Set up the equation or mathematical expression",
        "Solve step by step, showing all work",
        "Check the answer and verify it makes sense"
      ];
    }
    return [
      "Break down the mathematical concept into components",
      "Apply relevant mathematical principles",
      "Work through the solution systematically",
      "Verify the result"
    ];
  }

  getMathConcepts(type) {
    const concepts = {
      'problem-solving': ['Problem Analysis', 'Mathematical Modeling', 'Solution Verification'],
      'definition': ['Mathematical Definitions', 'Conceptual Understanding', 'Mathematical Relationships'],
      'explanation': ['Mathematical Reasoning', 'Logical Thinking', 'Pattern Recognition']
    };

    return concepts[type] || ['Mathematical Thinking', 'Problem Solving', 'Analytical Skills'];
  }

  getMathExamples(type) {
    return [
      "Practice with similar problems to build confidence",
      "Try variations of the problem with different numbers",
      "Look for real-world applications of this concept"
    ];
  }

  generateCSExplanation(question, type) {
    const explanations = {
      'problem-solving': `This programming problem requires understanding the algorithm and implementing an efficient solution. Let me walk through the approach and code structure.`,
      'definition': `This computer science concept is fundamental to understanding how systems work. I'll explain it clearly with practical examples.`,
      'explanation': `This topic in computer science involves understanding both theoretical concepts and practical implementation.`
    };

    return explanations[type] || `This computer science question involves analyzing the problem requirements and designing an appropriate solution using programming concepts.`;
  }

  generateCSSteps(question, type) {
    if (type === 'problem-solving') {
      return [
        "Understand the problem requirements and constraints",
        "Design the algorithm or approach",
        "Choose appropriate data structures",
        "Implement the solution with clean code",
        "Test with various inputs and edge cases"
      ];
    }
    return [
      "Break down the concept into manageable parts",
      "Understand the underlying principles",
      "See how it applies in real systems",
      "Practice with hands-on examples"
    ];
  }

  getCSConcepts(type) {
    const concepts = {
      'problem-solving': ['Algorithm Design', 'Data Structures', 'Problem Decomposition'],
      'definition': ['Computer Science Fundamentals', 'System Design', 'Programming Concepts'],
      'explanation': ['Computational Thinking', 'Software Engineering', 'System Analysis']
    };

    return concepts[type] || ['Programming Logic', 'Problem Solving', 'System Design'];
  }

  getCSExamples(type) {
    return [
      "Code examples with different programming languages",
      "Real-world applications in software development",
      "Practice problems with increasing complexity"
    ];
  }

  generatePhysicsExplanation(question, type) {
    const explanations = {
      'problem-solving': `This physics problem involves applying fundamental laws and principles. I'll guide you through the solution using proper physics methodology.`,
      'definition': `This physics concept explains how the natural world works. Let me break it down with clear explanations and examples.`,
      'explanation': `This physics topic connects theoretical understanding with observable phenomena in nature.`
    };

    return explanations[type] || `This physics question requires understanding the underlying principles and applying them to solve real-world scenarios.`;
  }

  generatePhysicsSteps(question, type) {
    if (type === 'problem-solving') {
      return [
        "Identify the physical quantities and given information",
        "Determine which physics laws or principles apply",
        "Set up the equations with proper units",
        "Solve mathematically step by step",
        "Check if the answer is physically reasonable"
      ];
    }
    return [
      "Understand the physical concept and its properties",
      "Connect theory with observable phenomena",
      "Apply the concept to solve problems",
      "Relate to other physics principles"
    ];
  }

  getPhysicsConcepts(type) {
    const concepts = {
      'problem-solving': ['Physics Laws', 'Mathematical Modeling', 'Unit Analysis'],
      'definition': ['Physical Principles', 'Natural Phenomena', 'Scientific Method'],
      'explanation': ['Physics Theory', 'Experimental Verification', 'Real-world Applications']
    };

    return concepts[type] || ['Physics Fundamentals', 'Scientific Reasoning', 'Problem Analysis'];
  }

  getPhysicsExamples(type) {
    return [
      "Real-world examples from everyday life",
      "Laboratory experiments that demonstrate the concept",
      "Applications in technology and engineering"
    ];
  }

  generateGeneralExplanation(question, context) {
    return `This is an interesting question that requires careful analysis. Let me provide a comprehensive explanation that covers the key aspects and helps you understand the topic thoroughly. ${context ? `Given the additional context you provided, I'll tailor my response accordingly.` : ''}`;
  }

  generateGeneralSteps(question) {
    return [
      "Analyze the question to understand what's being asked",
      "Gather relevant information and context",
      "Apply logical reasoning and knowledge",
      "Provide a clear and comprehensive answer"
    ];
  }

  extractConcepts(question) {
    // Simple keyword extraction for concepts
    const words = question.toLowerCase().split(/\s+/);
    const concepts = words.filter(word => word.length > 4 && !['what', 'how', 'why', 'when', 'where', 'which', 'that', 'this', 'with', 'from', 'they', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word));
    return concepts.slice(0, 3).map(concept => concept.charAt(0).toUpperCase() + concept.slice(1));
  }

  generateGeneralExamples(question) {
    return [
      "Practical applications of this concept",
      "Similar scenarios you might encounter",
      "Ways to apply this knowledge in different contexts"
    ];
  }

  generateStudyTips(subject, difficulty) {
    const tips = {
      'Mathematics': {
        'beginner': "Start with basic concepts and practice regularly. Use visual aids and work through examples step by step.",
        'intermediate': "Focus on understanding the underlying principles. Practice a variety of problems and learn to recognize patterns.",
        'advanced': "Develop problem-solving strategies and work on complex, multi-step problems. Connect different mathematical concepts."
      },
      'Computer Science': {
        'beginner': "Start with simple programs and understand basic syntax. Practice coding regularly and debug your programs.",
        'intermediate': "Focus on algorithms and data structures. Work on projects and understand time/space complexity.",
        'advanced': "Study advanced algorithms, system design, and work on complex projects. Contribute to open source."
      },
      'Physics': {
        'beginner': "Understand the basic concepts before moving to equations. Use diagrams and real-world examples.",
        'intermediate': "Practice problem-solving and connect mathematical formulas with physical intuition.",
        'advanced': "Work on complex problems and understand the derivations. Connect different areas of physics."
      }
    };

    return tips[subject]?.[difficulty] || "Practice regularly, understand the fundamentals, and don't hesitate to ask questions when you're stuck. Break complex problems into smaller, manageable parts.";
  }

  generateRelatedTopics(subject, questionType) {
    const topics = {
      'Mathematics': ['Algebra', 'Calculus', 'Statistics', 'Geometry', 'Number Theory'],
      'Computer Science': ['Algorithms', 'Data Structures', 'Programming Languages', 'Software Engineering', 'Machine Learning'],
      'Physics': ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Quantum Physics', 'Relativity'],
      'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Biochemistry'],
      'Biology': ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Molecular Biology']
    };

    return topics[subject] || ['Critical Thinking', 'Problem Solving', 'Research Methods'];
  }
}

// Export a singleton instance
const aiService = new AIService();
export default aiService;