import type { Message } from '../types/speech';

// Mock AI — replace the body of this function to wire in Claude, OpenAI, etc.
export async function getAIResponse(userMessage: string, _history: Message[]): Promise<string> {
  await new Promise((r) => setTimeout(r, 600)); // simulate latency

  const lower = userMessage.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! I'm your voice assistant. How can I help you today?";
  }
  if (lower.includes('how are you')) {
    return "I'm doing great, thanks for asking! What's on your mind?";
  }
  if (lower.includes('your name') || lower.includes('who are you')) {
    return "I'm a voice assistant built with the Web Speech API. You can replace my brain with Claude or any other AI!";
  }
  if (lower.includes('time') || lower.includes('date')) {
    return `Right now it's ${new Date().toLocaleTimeString()} on ${new Date().toLocaleDateString()}.`;
  }
  if (lower.includes('weather')) {
    return "I don't have access to live weather data yet, but you could wire in a weather API!";
  }
  if (lower.includes('joke')) {
    return "Why do programmers prefer dark mode? Because light attracts bugs!";
  }
  if (lower.includes('thank')) {
    return "You're welcome! Is there anything else I can help you with?";
  }
  if (lower.includes('bye') || lower.includes('goodbye')) {
    return "Goodbye! Have a great day!";
  }

  return `You said: "${userMessage}". I'm a mock assistant — swap me out with a real AI to get smarter responses!`;
}
