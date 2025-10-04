import { NextResponse } from 'next/server';

// This function runs on the server and securely handles the API key.
export async function POST(request) {
  // 1. Get the message from the request body sent from the client
  const { message } = await request.json();

  // 2. Load API Key securely
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("CONFIGURATION ERROR: GEMINI_API_KEY is not defined in .env.local");
    return NextResponse.json({ text: "Server configuration error: API key missing." }, { status: 500 });
  }

  // FIX: Updated the model name from 'gemini-pro' to the recommended 'gemini-2.5-flash'
  const modelUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    // 3. Make the secure fetch call to the external Gemini API
    const response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Ensure the contents payload is correctly structured
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: message }] }],
      }),
    });

    // 4. Handle non-200 responses from Gemini (e.g., 400, 403, 429)
    if (!response.ok) {
        // Log the full response status for debugging in the terminal
        console.error(`Gemini API returned status ${response.status}: ${response.statusText}`);
        
        // Try to parse error details if available
        const errorDetails = await response.text();
        console.error("Gemini Error Details:", errorDetails);
        
        return NextResponse.json({ 
            text: `API Error: Status ${response.status}. Please check server logs for details.` 
        }, { status: response.status });
    }

    // 5. Extract and return the generated text
    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
        console.warn("AI generated no text candidate for the message.");
        return NextResponse.json({ text: "The AI did not generate a response. Try rephrasing." });
    }
    
    return NextResponse.json({ text: generatedText });

  } catch (error) {
    // Catch network errors (like fetch failed)
    console.error("Network or Unexpected Error during API call:", error);
    return NextResponse.json({ text: "A network error occurred. Check your internet connection." }, { status: 500 });
  }
}
