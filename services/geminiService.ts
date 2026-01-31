
import { GoogleGenAI, Type } from "@google/genai";
import { WorkshopEvent, DailySummary } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getDailyBriefing(events: WorkshopEvent[]): Promise<DailySummary> {
  const eventList = events.map(e => `- ${e.time}: ${e.title} (${e.description})`).join('\n');
  
  const prompt = `
    Como um assistente de IA do CRIE Portal, analise a programação de hoje e crie um "Briefing do Mentor" curto e inspirador.
    O tom deve ser profissional, motivador e elegante. Use português brasileiro.
    
    Programação:
    ${eventList}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: {
              type: Type.STRING,
              description: 'Uma mensagem motivadora e um resumo do dia (máximo 300 caracteres).',
            },
            highlight: {
              type: Type.STRING,
              description: 'O evento mais importante do dia segundo sua análise.',
            },
          },
          required: ['message', 'highlight'],
        },
      },
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(jsonStr);
    return result as DailySummary;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      message: "Prepare-se para um dia de muito aprendizado e conexões transformadoras no CRIE Portal.",
      highlight: "Fique atento às notificações para não perder nada."
    };
  }
}
