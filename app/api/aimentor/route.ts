import { NextRequest, NextResponse } from "next/server";
// IMPORTING THE NEW SDK
import { GoogleGenAI } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { prompt, eventContext, currentSchedule } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const currentScheduleText = currentSchedule
      ? `\n\nCURRENT SCHEDULE STATE:\n${JSON.stringify(currentSchedule, null, 2)}`
      : "\n\nCURRENT SCHEDULE STATE: Empty (No events scheduled yet)";

    // System instruction defined here
    const systemInstruction = `You are an AI Event Coordinator. 
    Your goal is to manage an event agenda.
    
    EVENT CONTEXT:
    - Event: ${eventContext?.eventName || "General Event"}
    - Description: ${eventContext?.description || "Not specified"}
    - Participants: ${eventContext?.participants || "Various"}
    ${currentScheduleText}

    CRITICAL RULES:
    1. Output strictly valid JSON.
    2. Preserve existing events unless asked to change.
    3. Infer participants from the prompt.
    4. Valid types: "hackathon", "workshop", "seminar", "break", "social".
    
    REQUIRED JSON STRUCTURE:
    {
      "Monday": [
        { "id": "1", "timeSlot": "09:00-10:00", "title": "...", "type": "workshop", "location": "...", "participants": ["..."], "description": "..." }
      ],
      "Tuesday": [], "Wednesday": [], "Thursday": [], "Friday": [], "Saturday": [], "Sunday": []
    }`;

    // CALLING THE NEW SDK
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Change to 'gemini-3-flash-preview' if you have access
      config: {
        // This is a powerful feature of the new SDK:
        responseMimeType: 'application/json', 
      },
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemInstruction + `\n\nUSER REQUEST: "${prompt}"` }
          ]
        }
      ]
    });

    // Parse the result
    const text = response.text;
    
    // Since we requested JSON MimeType, we can parse directly usually
    let scheduleData;
    try {
        scheduleData = JSON.parse(text || "{}");
    } catch (e) {
        console.error("JSON Parse Error", e);
        // Fallback cleanup if the model still adds markdown
        const cleanText = text?.replace(/```json/g, "").replace(/```/g, "") || "{}";
        scheduleData = JSON.parse(cleanText);
    }

    // Clean and Validate Data (same logic as before)
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const cleanedSchedule: any = {};

    validDays.forEach((day) => {
      cleanedSchedule[day] = [];
      if (scheduleData[day] && Array.isArray(scheduleData[day])) {
        scheduleData[day].forEach((entry: any) => {
          if (entry.timeSlot && entry.title) {
            cleanedSchedule[day].push({
              id: entry.id || Math.random().toString(36).substr(2, 9),
              timeSlot: entry.timeSlot,
              title: entry.title,
              type: entry.type || "workshop",
              location: entry.location || "TBD",
              participants: Array.isArray(entry.participants) ? entry.participants : [],
              description: entry.description || "",
            });
          }
        });
      }
    });

    return NextResponse.json({
      success: true,
      schedule: cleanedSchedule,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Error with GoogleGenAI SDK:", error);
    return NextResponse.json(
      { error: "Failed to process schedule request" },
      { status: 500 }
    );
  }
}