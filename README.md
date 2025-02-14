# WebGPT

WebGPT is a modern, lightweight web-based chat application that leverages a GPT model to deliver natural language responses. Built with clean, modular JavaScript, WebGPT features an engaging chat interface with animated typing effects, Markdown and code formatting, token usage tracking, and interactive message controls like copy-to-clipboard and text-to-speech.

## Features

- **Responsive Chat Interface:** Auto-resizing input area and smooth scroll-to-bottom for a fluid conversation experience.
- **Animated Typing Effect:** Simulates real-time typing for AI responses, enhancing user engagement.
- **Markdown & Code Formatting:** Uses [marked.js](https://github.com/markedjs/marked) and [highlight.js](https://highlightjs.org/) to render Markdown content and highlight code blocks.
- **Token Usage Tracking:** Displays prompt and completion token counts for each interaction.
- **Interactive Message Buttons:** Provides copy-to-clipboard and text-to-speech functionalities for AI responses.
- **Customizable AI Prompts:** Easily adjust the system prompt to tailor the chatbot’s behavior to your website’s needs.

## Getting Started

1. **Obtain an API Key:**
   - Sign up for an API Key on the [OpenAI platform](https://platform.openai.com/account/api-keys).
   - Insert your API Key into **script.js** inside the `requestCompletionFrontend` function:
     ```javascript
     const apiKey = "YOUR_API_KEY_HERE"; // Replace with your OpenAI API Key
     ```
   - **Important:** Do not hard-code your API key in production. Use secure methods to store and retrieve sensitive keys.

2. **Installation:**
   - Clone this repository:
     ```
     git clone https://github.com/yourusername/WebGPT.git
     ```
   - Open the project directory in your browser or deploy it on your web server.

3. **Dependencies:**
   - The project loads external libraries via CDN:
     - [marked.js](https://github.com/markedjs/marked) for Markdown parsing.
     - [highlight.js](https://highlightjs.org/) for syntax highlighting.
   - Alternatively, you can download these libraries for local hosting.

## Customization

- **Customizing AI Behavior:**
  - Modify the system prompt inside **script.js** (in the `requestCompletionFrontend` function) to tailor the bot’s personality and responses:
    ```javascript
    const basePrompt = [
      "You are a web chat bot inside of the website: https://example.com",
      "",
      "Assist users by providing information about the site's features and answering questions.",
      "",
      "If users ask you for code, return any code in code format.",
      "",
      "Keep responses friendly and engaging, and encourage users to explore the website further.",
    ].join("\n");
    ```
- **UI & Functionality Adjustments:**
  - Update **index.html** and the accompanying CSS file to match your branding and design requirements.
  - Enhance or modify the JavaScript functions in **script.js** to add new features or tweak existing behaviors.

## Disclaimer

WebGPT uses a language model developed by OpenAI and is not a product or service offered by OpenAI. Use this project responsibly and ensure your implementation adheres to OpenAI's usage policies.

## Links

- [OpenAI](https://openai.com/) ➚  
- [KingLabs](https://kinglabs.app) ➚  
- [KingLabs Discord Server](https://discord.gg/J5FwejrmEF) ➚
