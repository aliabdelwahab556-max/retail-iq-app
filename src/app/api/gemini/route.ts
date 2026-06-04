import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, userText, modelName, userApiKey } = await req.json();

    // Server-only env var takes priority; fall back to user-supplied key from settings
    const apiKey = process.env.GEMINI_API_KEY || userApiKey;

    if (!apiKey) {
      return NextResponse.json({ error: "no_key" }, { status: 400 });
    }

    if (!userText || typeof userText !== "string") {
      return NextResponse.json({ error: "Missing userText" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName || "gemini-1.5-flash" });

    const result = await model.generateContent([systemPrompt || "", userText]);
    const text = await result.response.text();

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("Gemini API route error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
