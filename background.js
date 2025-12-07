// WARNING: DO NOT HARDCODE THIS KEY FOR PRODUCTION.
// For a Chrome extension, the user should input the key via a settings page
// and store it in chrome.storage.
const GEMINI_API_KEY = "AIzaSyBI8A4dK0gbEea-sYj_KPjbkS0lGvL68eE";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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