// WARNING: Do not hardcode your API key in a public script.
// For a Chrome extension, use chrome.storage to store it securely.
const GEMINI_API_KEY = "AIzaSyBI8A4dK0gbEea-sYj_KPjbkS0lGvL68eE";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

document.getElementById("askBtn").addEventListener("click", async () => {
  const question = document.getElementById("question").value;
  if (!question) {
    document.getElementById("response").innerText = "Please enter a question.";
    return;
  }
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Update UI to show a loading state
  document.getElementById("response").innerText = "Thinking...";

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    // A more robust function to get the transcript
    func: () => {
      // Find and click the 'Show transcript' button if it exists
      const transcriptButton = document.querySelector('ytd-video-description-transcript-section-renderer button');
      if (transcriptButton) {
        transcriptButton.click();
      }

      // Now, wait for the transcript to load and return its content
      return new Promise(resolve => {
        let attempts = 0;
        const maxAttempts = 20; // Try for up to 10 seconds

        const checkTranscript = () => {
          const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
          if (segments.length > 0) {
            let transcript = '';
            segments.forEach(seg => {
              // Use spaces instead of newlines for a better prompt
              transcript += seg.innerText + ' ';
            });
            resolve(transcript);
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(checkTranscript, 500); // Check again after 500ms
          } else {
            resolve("Transcript not available. This video might not have subtitles.");
          }
        };

        checkTranscript();
      });
    }
  }, async (results) => {
    const transcript = results[0].result;
    
    // If transcript is not available, show the message and stop.
    if (transcript.startsWith("Transcript not available")) {
      document.getElementById("response").innerText = transcript;
      return;
    }

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are a helpful assistant that answers questions based on a YouTube video transcript. Include timestamps where relevant. If you can't find the answer, state that it's not in the provided transcript.
                  
Transcript: ${transcript}
                  
Question: ${question}`
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      document.getElementById("response").innerText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer.";
    } catch (error) {
      console.error('Error fetching from Gemini API:', error);
      document.getElementById("response").innerText = `Error: ${error.message}`;
    }
  });
});