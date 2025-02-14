/**
 * Configure marked.js to work with highlight.js and use a custom renderer.
 * This setup enables syntax highlighting for code blocks and adds a header
 * with a language label and a copy-to-clipboard button.
 */

// Create a custom renderer for marked.
const customRenderer = new marked.Renderer();

/**
 * Override the default code block rendering.
 * This function wraps the code in a container that includes a header displaying
 * the language and a copy button.
 *
 * @param {string} code - The code content to render.
 * @param {string} lang - The language identifier for syntax highlighting.
 * @returns {string} The HTML string for the formatted code block.
 */
customRenderer.code = function (code, lang) {
  // Default to "plaintext" if no language is provided.
  const language = lang || "plaintext";
  // Create a copy button that calls a global 'copyCode' function when clicked.
  const copyButton = `<button class="copy-btn" onclick="copyCode(this)">📋 Copy</button>`;
  
  // Return the HTML structure for the code block.
  return `
    <div class="code-block">
      <div class="code-header">
        <span class="file-type">${language}</span>
        ${copyButton}
      </div>
      <pre><code class="hljs language-${language}">${hljs.highlight(code, { language }).value}</code></pre>
    </div>
  `;
};

// Set options for marked, including our custom renderer and syntax highlighting configuration.
marked.setOptions({
  renderer: customRenderer,
  // Syntax highlighting function using highlight.js.
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  langPrefix: "hljs language-", // Prefix for CSS classes applied to code blocks.
  gfm: true,    // Enable GitHub Flavored Markdown.
  breaks: true, // Convert line breaks in markdown to <br> tags.
});

/**
 * Formats Markdown text into HTML.
 *
 * @param {string} text - The Markdown text to format.
 * @returns {string} The resulting HTML.
 */
function formatMarkdown(text) {
  return marked.parse(text);
}

// Expose the formatMarkdown function globally for use in other scripts (e.g., script.js).
window.formatMarkdown = formatMarkdown;
