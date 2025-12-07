(async () => {
  const apiKey = "Your_api_key"; // <-- Replace with your actual Gemini API key
  const url = "Api_key_url ";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: "Tell me a fun fact about space." }
          ]
        }
      ]
    })
  });

  const result = await response.json();
  
  // The structure of the response is the same as the previous example.
  const content = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No content found.';
  console.log(content);
  

})();
