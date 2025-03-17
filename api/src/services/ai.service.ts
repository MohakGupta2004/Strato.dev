import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig:{
    responseMimeType: "application/json",
    temperature: 0.4,
    maxOutputTokens: 8192,
  },
  systemInstruction: `
You are a senior full-stack developer creating clean, production-ready code.

Always respond in this JSON format:
{
  "text": "Brief description of what you created",
  "fileTree": {
    "filename.ext": {
      "file": {
        "contents": "file content here"
      }
    },
    "another-file.ext": {
      "file": {
        "contents": "more content here"
      }
    }
  },
  "codeType": "javascript or typescript",
  "buildCommand": {
    "mainItem": "npm",
    "commands": ["install"]
  },
  "startCommand": {
    "mainItem": "node or npm",
    "commands": ["start or filename.js"]
  }
}

IMPORTANT: Always use this exact JSON structure with "file" and "contents" properties.
`,
});

export const aiResponse = async (prompt: string) => {
  try {
    // Check if this is just a simple conversational message
    const isConversational = /^(hi|hello|hey|how are you|what's up|good morning|good afternoon|good evening|thanks|thank you)/i.test(prompt.trim());
    
    if (isConversational) {
      // For simple conversational messages, use a different model setup
      const conversationModel = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
        // No system instruction for conversational responses
      });
      
      const result = await conversationModel.generateContent(prompt);
      const responseText = result.response.text();
      
      // Directly return the text without JSON wrapping
      return JSON.stringify({
        text: responseText,
        fileTree: {} // Empty fileTree
      });
    }
    
    // Regular code generation flow for non-conversational messages
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI request timed out')), 30000)
    );
    
    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]) as any;
    
    if (!result || !result.response) {
      throw new Error('Empty response from AI service');
    }
    
    const responseText = result.response.text();
    
    try {
      const parsed = JSON.parse(responseText);
      
      // Ensure text field isn't too long
      if (parsed.text && parsed.text.length > 300) {
        parsed.text = parsed.text.substring(0, 300) + "...";
      }
      
      return JSON.stringify(parsed);
    } catch (e) {
      console.log('Response was not valid JSON, attempting to extract JSON portion');
      
      const jsonPattern = /(\{[\s\S]*\})/;
      const match = responseText.match(jsonPattern);
      
      if (match && match[1]) {
        try {
          const extracted = JSON.parse(match[1]);
          return JSON.stringify(extracted);
        } catch (innerError) {
          console.error('Failed to parse extracted JSON:', innerError);
        }
      }
      
      return JSON.stringify({
        text: responseText.substring(0, 1000),
        fileTree: {}
      });
    }
  } catch (error) {
    console.error("AI service error:", error);
    return JSON.stringify({
      text: "Sorry, I encountered an error processing your request. Please try again with a simpler prompt.",
      fileTree: {}
    });
  }
};
