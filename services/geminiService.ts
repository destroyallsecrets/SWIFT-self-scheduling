import { GoogleGenAI, Type } from "@google/genai";
import { Shift } from '../types';

// Using Gemini as the "OCR or similar API" due to its superior multimodal capabilities 
// for extracting structured data from messy screenshots compared to raw Tesseract.js.
// It also handles the "Smart Paste" logic.

const getAI = () => {
    const key = process.env.API_KEY;
    if (!key) {
        throw new Error("API Key is missing. Please configure VITE_API_KEY or API_KEY in your environment.");
    }
    return new GoogleGenAI({ apiKey: key });
};

const SYSTEM_INSTRUCTION = `
You are a specialized data extraction engine for a work scheduling application called SWIFT. 
Your goal is to extract shift details from text or images.
Input might be a screenshot of a schedule (OCR) or raw pasted text.
Extract the following for each shift:
- Start Date and Time
- End Date and Time
- Job Name / Role
- Venue Name
- Address (if available, otherwise infer from venue or leave blank)

Current Year Context: Assume the year is 2026 unless specified otherwise.
Return a JSON object containing an array of shifts.
`;

// Wrapped in a root object for better stability
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    shifts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          startDate: { type: Type.STRING, description: "ISO 8601 Combined Date and Time String (YYYY-MM-DDTHH:mm:ss.sssZ)" },
          endDate: { type: Type.STRING, description: "ISO 8601 Combined Date and Time String (YYYY-MM-DDTHH:mm:ss.sssZ)" },
          jobName: { type: Type.STRING },
          venueName: { type: Type.STRING },
          address: { type: Type.STRING },
        },
        required: ["startDate", "endDate", "jobName", "venueName"],
      },
    }
  }
};

export const parseScheduleFromImage = async (base64Image: string): Promise<Shift[]> => {
  try {
    const ai = getAI();
    
    // Robust parsing for Data URIs (handling jpeg, png, webp, heic, etc.)
    const matches = base64Image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    
    let mimeType = 'image/jpeg';
    let cleanBase64 = base64Image;

    if (matches && matches.length === 3) {
        mimeType = matches[1];
        cleanBase64 = matches[2];
    } else {
        // Fallback: simple split if regex fails, assuming standard format
        const split = base64Image.split(',');
        if (split.length > 1) {
            cleanBase64 = split[1];
             // Try to guess mime from header if possible, or stick to jpeg default which GenAI handles well usually
            const header = split[0];
            const mimeMatch = header.match(/:(.*?);/);
            if (mimeMatch) {
                mimeType = mimeMatch[1];
            }
        }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          { text: "Extract the schedule data from this image into a JSON structure." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.1, // Low temp for extraction accuracy
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      // Handle both root array (legacy) or new root object structure
      const shiftsArray = Array.isArray(parsed) ? parsed : (parsed.shifts || []);
      
      return shiftsArray.map((item: any) => ({
        ...item,
        id: crypto.randomUUID()
      }));
    }
    return [];
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    // Throwing a string message allows the UI to display it
    throw new Error("AI extraction failed. Please ensure your API Key is valid and the image is clear.");
  }
};

export const parseScheduleFromText = async (text: string): Promise<Shift[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract schedule from this text: \n\n${text}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.1,
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text);
      const shiftsArray = Array.isArray(parsed) ? parsed : (parsed.shifts || []);

      return shiftsArray.map((item: any) => ({
        ...item,
        id: crypto.randomUUID()
      }));
    }
    return [];
  } catch (error) {
    console.error("Gemini Text Error:", error);
    throw new Error("AI text parsing failed. Please try again.");
  }
};