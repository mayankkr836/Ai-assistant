"use client";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi 👋, I am Mayank Ai Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    // 1. Validate and update state for user message
    if (input.trim() === '') return;

    const userMessage = { role: "user", content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 2. Call your secure local API route
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Send only the new message content to the API route
        body: JSON.stringify({ message: userMessage.content }),
      });

      // 3. Handle the response
      const data = await res.json();
      
      const aiResponse = data.text 
        ? data.text 
        : "Sorry, I received an error from the server.";
        
      const aiMessage = { role: "assistant", content: aiResponse };
      setMessages(prevMessages => [...prevMessages, aiMessage]);

    } catch (error) {
      console.error("Failed to fetch from API route:", error);
      setMessages(prevMessages => [
        ...prevMessages, 
        { role: "assistant", content: "⚠️ Error connecting to API route." }
      ]);
    } finally {
      // 4. Stop loading state
      setLoading(false);
    }
  };

  return (
    // FIX: Removed w-screen/overflow-hidden and added a combination of right margin (mr-[-16px])
    // and right padding (pr-4) to safely push the Next.js dev overlay off the visible edge
    // without affecting the horizontal scroll or layout.
    <div className="flex flex-col h-screen bg-gray-900 text-white mr-[-16px] pr-4">
      <header className="bg-indigo-700 text-xl font-extrabold p-4 shadow-2xl flex items-center justify-between">
        <span className="flex items-center space-x-2">
            <span className="text-3xl">🤖</span>
            <span>AI Assistant</span>
        </span>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-4 max-w-lg rounded-xl shadow-lg whitespace-pre-wrap transition-all duration-300 ${
              msg.role === "user"
                ? "bg-indigo-600 text-white ml-auto rounded-br-none"
                : "bg-gray-700 text-gray-100 rounded-tl-none mr-auto"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
            <div className="flex items-center space-x-2 text-indigo-400 italic">
                <div className="animate-pulse">...</div>
                <span>Assistant is thinking</span>
            </div>
        )}
      </main>

      <footer className="p-4 bg-gray-800 border-t border-gray-700 flex gap-3 shadow-inner">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-3 border-2 border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-700 text-white placeholder-gray-400"
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className={`px-5 py-3 rounded-xl font-semibold transition-all duration-200 ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
          }`}
          disabled={loading}
        >
          Send
        </button>
      </footer>
    </div>
  );
}