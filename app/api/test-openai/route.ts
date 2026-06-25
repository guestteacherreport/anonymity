import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log(
      "KEY:",
      process.env.OPENAI_API_KEY
    );

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response =
      await openai.chat.completions.create({
        model: "gpt-4.0-mini",

        messages: [
          {
            role: "user",
            content: "Say hello",
          },
        ],
      });

    return NextResponse.json({
      success: true,
      data:
        response.choices[0].message.content,
    });
  } catch (error: any) {
    console.log(error);

    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}