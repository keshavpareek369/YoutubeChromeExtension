// A simple way to manage your API key. For production, use a more secure method.
let transcriptCache = null;
let overlay = null;

function createOverlayUI() {
  if (overlay) return;

  overlay = document.createElement("div");
  overlay.id = "chatbot-overlay";
  overlay.style.cssText = `
    position: fixed; bottom: 10px; right: 10px; z-index: 99999;
    background: white; border: 1px solid #ccc; padding: 10px;
    width: 300px; max-height: 300px; overflow-y: auto;
    font-family: Arial; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  `;

  const input = document.createElement("textarea");
  input.placeholder = "Ask a question...";
  input.rows = 2;
  input.style.width = "100%";

  const button = document.createElement("button");
  button.innerText = "Ask";
  button.style.marginTop = "5px";

  const responseDiv = document.createElement("div");
  responseDiv.style.marginTop = "10px";
  responseDiv.style.whiteSpace = "pre-wrap";

  button.onclick = async () => {
    const question = input.value.trim();
    if (!question) return;

    responseDiv.innerText = "Thinking..."; 
    
    // Use the robust transcript retrieval method
    const transcript = await getTranscript();
    if (transcript.startsWith("Transcript not available")) {
      responseDiv.innerText = transcript;
      return;
    }

    const answer = await fetchAnswer(transcript, question);
    responseDiv.innerText = answer;
  };

  overlay.appendChild(input);
  overlay.appendChild(button);
  overlay.appendChild(responseDiv);
  document.body.appendChild(overlay);
}

// Updated getTranscript function to handle dynamic loading
async function getTranscript() {
  if (transcriptCache) return transcriptCache;

  const transcriptButton = document.querySelector('ytd-video-description-transcript-section-renderer button');
  if (transcriptButton) {
    transcriptButton.click();
  }

  return new Promise(resolve => {
    let attempts = 0;
    const maxAttempts = 20;

    const checkTranscript = () => {
      const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
      if (segments.length > 0) {
        let transcript = '';
        segments.forEach(seg => {
          transcript += seg.innerText.trim() + ' ';
        });
        transcriptCache = transcript;
        resolve(transcript);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(checkTranscript, 500);
      } else {
        resolve("Transcript not available. This video might not have subtitles.");
      }
    };
    checkTranscript();
  });
}

// Updated fetchAnswer to get API key from background script
async function fetchAnswer(transcript, question) {
  const { apiKey, apiUrl } = await chrome.runtime.sendMessage({ action: "getGeminiInfo" });

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey 
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: `You are a helpful assistant that answers questions based on a YouTube video transcript. Include timestamps where relevant. Transcript: ${transcript}\n\nQuestion: ${question}` }
          ]
        }
      ]
    })
  });

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}

createOverlayUI();