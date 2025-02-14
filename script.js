// ------------------------------
// DOM Element Selections & Global Variables
// ------------------------------
const inputField = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const chatContainer = document.getElementById("chat-main");

// Tracks the total tokens used across interactions.
let totalTokensUsed = 0;

// ------------------------------
// Input Field Auto-resize & Event Listeners
// ------------------------------

// Set initial textarea height.
inputField.style.height = "40px";

// Adjust textarea height based on content while capping at 200px.
inputField.addEventListener("input", () => {
  inputField.style.height = "40px"; // Reset to minimum height
  if (inputField.scrollHeight <= 200) {
    inputField.style.height = `${inputField.scrollHeight}px`;
  } else {
    inputField.style.height = "200px"; // Maximum height reached; enable scrolling
    inputField.style.overflowY = "auto";
  }
});

// Send message on Enter (unless Shift is pressed).
inputField.addEventListener("keyup", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    sendMessage();
  }
});

// Listen for send button clicks.
sendButton.addEventListener("click", sendMessage);

// ------------------------------
// Main Message Sending Functionality
// ------------------------------

/**
 * Sends the user's message:
 * - Appends the user's message to the chat.
 * - Resets the input field.
 * - Displays a loader while waiting for the AI response.
 * - Calls the API and appends the AI response with token details.
 */
async function sendMessage() {
  const userMessage = inputField.value.trim();
  if (!userMessage) return;

  // Append user's message to the chat.
  appendMessage("user", userMessage);

  // Clear and reset the input field.
  inputField.value = "";
  inputField.style.height = "40px";

  // Show a loader for the AI's response.
  const loaderElement = appendLoader();

  try {
    // Request AI completion using the frontend API call.
    const response = await requestCompletionFrontend(userMessage);
    const data = await response.json();

    console.log("AI Payload:", data);

    // Extract AI response text, or provide a fallback.
    const aiText =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content
        ? data.choices[0].message.content.trim()
        : "I'm sorry, I didn't understand that.";

    // Update token count.
    const usage = data.usage;
    totalTokensUsed += usage.total_tokens;
    document.getElementById("token-counter").textContent = `${totalTokensUsed}`;

    // Create a header element displaying token usage details.
    const tokenInfo = document.createElement("div");
    tokenInfo.classList.add("ai-message-header");
    tokenInfo.innerHTML = `<small>Prompt Tokens: ${usage.prompt_tokens} | Completion Tokens: ${usage.completion_tokens}</small>`;

    // Remove the loader and display the AI's response.
    removeLoader(loaderElement);
    appendMessage("ai", aiText, tokenInfo);
  } catch (error) {
    console.error(error);
    removeLoader(loaderElement);
    appendMessage("ai", "There was an error processing your request. Please try again.");
  }
}

// ------------------------------
// API Request Functionality
// ------------------------------

/**
 * Sends a request to the OpenAI API with the user's message.
 * The function includes a base system prompt to guide the AI.
 *
 * @param {string} userMessage - The user's chat message.
 * @returns {Promise<Response>} - The fetch API response.
 */
async function requestCompletionFrontend(userMessage) {
  // WARNING: Do not hard-code API keys in production!
  const apiKey = "";

  // Base prompt to define the AI's behavior.
  const basePrompt = [
    "You are a web chat bot inside of the website: https://example.com",
    "",
    "Assist users by providing information about the site's features and answering questions.",
    "",
    "If users ask you for code, return any code in code format.",
    "",
    "Keep responses friendly and engaging, and encourage users to explore the website further.",
  ].join("\n");

  // Compose the conversation for the API.
  const messages = [
    { role: "system", content: basePrompt },
    { role: "user", content: userMessage },
  ];

  // Make the API request.
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      // Using gpt-4o-mini for low cost. [input: $0.150/1M tokens | cached input: $0.075/1M tokens | output: $0.600/1M tokens]
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 2500,
      temperature: 0.7,
    }),
  });
  return response;
}

// ------------------------------
// Animated Typing & Markdown Formatting
// ------------------------------

/**
 * Animates the AI response by simulating a typing effect.
 * It handles both plain text and code segments (delimited by triple backticks).
 *
 * @param {HTMLElement} container - The container where the text is rendered.
 * @param {string} text - The full text to animate.
 * @param {Function} [callback] - Optional callback executed after animation.
 */
async function animateTyping(container, text, callback) {
  // Regex to identify code blocks in the format ```language\ncode```
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  // Split text into segments (plain text and code blocks).
  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.substring(lastIndex, match.index) });
    }
    segments.push({ type: "code", language: match[1], content: match[2] });
    lastIndex = codeBlockRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.substring(lastIndex) });
  }

  /**
   * Processes each segment sequentially.
   * For plain text, characters are added one by one.
   * Code blocks are rendered immediately.
   *
   * @param {number} index - Current segment index.
   */
  async function processSegment(index) {
    if (index >= segments.length) {
      if (callback) callback();
      return;
    }
    const segment = segments[index];
    if (segment.type === "text") {
      // Create a span to hold the text.
      const span = document.createElement("span");
      container.appendChild(span);
      let currentText = "";
      let charIndex = 0;

      // Animate each character with a 20ms interval.
      const interval = setInterval(() => {
        currentText += escapeHtml(segment.content.charAt(charIndex));
        // Format text with inline Markdown (e.g., **bold**, `code`)
        span.innerHTML = formatMarkdown(currentText);
        charIndex++;
        if (charIndex >= segment.content.length) {
          clearInterval(interval);
          processSegment(index + 1);
        }
      }, 20);
    } else if (segment.type === "code") {
      // Immediately append the formatted code block.
      container.innerHTML += formatMarkdown("```" + segment.language + "\n" + segment.content + "\n```");
      processSegment(index + 1);
    }
  }
  await processSegment(0);
}

// ------------------------------
// Appending Messages to the Chat
// ------------------------------

/**
 * Appends a new chat message to the chat container.
 *
 * @param {string} sender - "user" or "ai" to indicate the message source.
 * @param {string} text - The message content.
 * @param {HTMLElement} [tokenInfo] - Optional element containing token details for AI messages.
 */
async function appendMessage(sender, text, tokenInfo) {
  // Create the main message container.
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", sender);

  // Create the text bubble container.
  const textElement = document.createElement("div");
  textElement.classList.add("text");
  messageElement.appendChild(textElement);

  // For AI messages, add token info and animate typing.
  if (sender === "ai") {
    textElement.appendChild(tokenInfo);
    addMessageButtons(tokenInfo, text);
    await animateTyping(textElement, text);
  } else {
    // For user messages, escape HTML and format Markdown.
    textElement.innerHTML = formatMarkdown(escapeHtml(text));
  }

  chatContainer.appendChild(messageElement);
  // Ensure the chat scrolls to show the latest message.
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ------------------------------
// Message Buttons (Copy & Speak)
// ------------------------------

/**
 * Adds interactive buttons (Copy and Speak) to an AI message.
 *
 * @param {HTMLElement} tokenInfo - The container where buttons are appended.
 * @param {string} text - The AI message text.
 */
function addMessageButtons(tokenInfo, text) {
  // Create a container for the buttons.
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("message-buttons", "flex-items-c-align-c", "gap-5");

  // --- Copy Button ---
  const copyButton = document.createElement("button");
  copyButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#9ca0aa" style="height:15px;width:15px;">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
  </svg>`;
  copyButton.title = "Copy message";
  // Uses the Clipboard API to copy the full text.
  copyButton.onclick = () => navigator.clipboard.writeText(text);

  // --- Speak Button ---
  const speakButton = document.createElement("button");
  speakButton.innerHTML = getSpeakIcon();
  speakButton.title = "Speak message";

  // Initialize speech synthesis for the message.
  let speech = new SpeechSynthesisUtterance();
  let isSpeaking = false;

  // Set up voice preferences.
  function setVoice() {
    const voices = speechSynthesis.getVoices();
    // Prefer "Microsoft Hazel" if available, else default to the first voice.
    const selectedVoice = voices.find((voice) => voice.name.includes("Microsoft Hazel")) || voices[0];
    if (selectedVoice) {
      speech.voice = selectedVoice;
    }
  }

  // Ensure voices are loaded.
  if (speechSynthesis.getVoices().length > 0) {
    setVoice();
  } else {
    speechSynthesis.onvoiceschanged = setVoice;
  }

  // Configure speech synthesis parameters.
  speech.text = text;
  speech.lang = "en-GB";
  speech.rate = 1.6;

  // Toggle between speaking and stopping.
  speakButton.onclick = () => {
    if (!isSpeaking) {
      speechSynthesis.speak(speech);
      speakButton.innerHTML = getStopIcon();
      isSpeaking = true;
    } else {
      speechSynthesis.cancel();
      speakButton.innerHTML = getSpeakIcon();
      isSpeaking = false;
    }
  };

  // Reset button state when speech ends.
  speech.onend = () => {
    speakButton.innerHTML = getSpeakIcon();
    isSpeaking = false;
  };

  // Append buttons to the container and attach to tokenInfo.
  buttonContainer.append(copyButton, speakButton);
  tokenInfo.appendChild(buttonContainer);
}

// ------------------------------
// Helper Functions for Icons & HTML Escaping
// ------------------------------

/**
 * Returns the SVG markup for the "Speak" icon.
 * @returns {string} - SVG markup.
 */
function getSpeakIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#9ca0aa" style="height:15px;width:15px;">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>`;
}

/**
 * Returns the SVG markup for the "Stop" icon.
 * @returns {string} - SVG markup.
 */
function getStopIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#9ca0aa" style="height:15px;width:15px;">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z" />
  </svg>`;
}

/**
 * Escapes HTML characters to prevent injection.
 *
 * @param {string} unsafe - The unescaped string.
 * @returns {string} - The escaped string.
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ------------------------------
// Loader Display Functions
// ------------------------------

/**
 * Creates and appends a loader element to the chat to indicate an AI response is pending.
 *
 * @returns {HTMLElement} - The loader element.
 */
function appendLoader() {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", "ai");

  // Create an avatar-like element to display the animated SVG.
  const avatar = document.createElement("div");
  avatar.classList.add("avatar");

  const img = document.createElement("img");
  // SVG spinner (with inline SVG data) to indicate loading.
  img.src =
    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150"><path fill="none" stroke="%237FFFD4" stroke-width="15" stroke-linecap="round" stroke-dasharray="300 385" stroke-dashoffset="0" d="M275 75c0 31-27 50-50 50-58 0-92-100-150-100-28 0-50 22-50 50s23 50 50 50c58 0 92-100 150-100 24 0 50 19 50 50Z"><animate attributeName="stroke-dashoffset" calcMode="spline" dur="2" values="685;-685" keySplines="0 0 1 1" repeatCount="indefinite"></animate></path></svg>';
  img.alt = "Thinking";

  avatar.appendChild(img);
  messageElement.appendChild(avatar);

  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return messageElement;
}

/**
 * Removes the loader element from the DOM.
 *
 * @param {HTMLElement} loaderElement - The loader element to remove.
 */
function removeLoader(loaderElement) {
  if (loaderElement && loaderElement.parentNode) {
    loaderElement.parentNode.removeChild(loaderElement);
  }
}


function copyCode(button) {
  const codeElement = button.closest(".code-block").querySelector("code");
  const textArea = document.createElement("textarea");

  textArea.value = codeElement.innerText;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);

  // Change button text temporarily to indicate success
  button.innerText = "✅ Copied!";
  setTimeout(() => {
    button.innerText = "📋 Copy";
  }, 2000);
}
