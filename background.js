const GEMINI_API_KEY = "Your_gemini_api";
const GEMINI_API_URL = "gemini_api_url";

chrome.runtime.onInstalled.addListener(() => {
  console.log("YouTube Transcript Chatbot Installed.");
});

// Listener to handle messages from popup.js and content.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "getGeminiInfo") {
      sendResponse({ apiKey: GEMINI_API_KEY, apiUrl: GEMINI_API_URL });
      return true; // Indicates an asynchronous response
    }
  }

);

