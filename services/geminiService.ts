import { GoogleGenAI, Type } from "@google/genai";
import { Shift } from '../types';

// Using Gemini as the "OCR or similar API" due to its superior multimodal capabilities 
// for extracting structured data from messy screenshots compared to raw Tesseract.js.
// It also handles the "Smart Paste" logic.

const getAI = () => {
    // NOTE: This relies on the process.env.API_KEY being injected by the environment.
    // In a real deployed client-side app, this would be a proxy service to hide the key,
    // but for this specific generated output format, we use the env variable directly.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
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
Return strictly a JSON array of objects.
`;

const RESPONSE_SCHEMA = {
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
};

export const parseScheduleFromImage = async (base64Image: string): Promise<Shift[]> => {
  try {
    const ai = getAI();
    // Remove header if present for the API call
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Changed to flash-preview to support multimodal input + JSON Schema
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg/png generic handling
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
      return parsed.map((item: any) => ({
        ...item,
        id: crypto.randomUUID()
      }));
    }
    return [];
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw new Error("Failed to process image. Ensure API Key is valid.");
  }
};

export const parseScheduleFromText = async (text: string): Promise<Shift[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Good for fast text processing
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
      return parsed.map((item: any) => ({
        ...item,
        id: crypto.randomUUID()
      }));
    }
    return [];
  } catch (error) {
    console.error("Gemini Text Error:", error);
    throw new Error("Failed to process text.");
  }
};
