# RegExplore

> Regex ain’t scary anymore. Welcome to RegExplore.

![App Diagram Flow](/images/flow.png)

RegExplore is a powerful, interactive web application designed to help developers create, test, understand, and visualize regular expressions in real-time. Built with pure JavaScript, HTML, and CSS, this client-side application requires no backend and offers a comprehensive set of tools for working with regex patterns.

## Key Features

### Core Functionality

- **Live Regex Testing**: Test patterns against any input text with real-time highlighting
- **Multiple Explanation Modes**:
  - Technical breakdown of each regex component
  - Plain English explanations of what patterns match
- **Visual Pattern Playground**: See your regex as an interactive node-based graph
- **Comprehensive Pattern Library**: Access common regex patterns for emails, URLs, and more
- **Community Pattern Repository**: Share and discover patterns from other developers

### Advanced Tools

- **Test Suite Mode**: Create, save, and run test cases against your regex
- **Regex Coach**: Get smart hints and suggestions to improve your patterns
- **Export Options**: Export as code snippets (JavaScript, Python, PHP, etc.), markdown, or JSON
- **Shareable URLs**: Generate links to share regex patterns with others
- **Dark/Light Mode**: Choose the interface style that works for you

## Use Cases

- **Learning Tool**: Perfect for beginners to understand regex concepts visually
- **Development Aid**: Quickly build and test patterns for your projects
- **Troubleshooting**: Debug complex patterns with visual breakdowns
- **Documentation**: Export well-documented patterns for team sharing
- **Testing**: Verify patterns against multiple test cases

## Technical Details

### Built With

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Visualization**: vis.js for the regex graph visualization
- **Syntax Highlighting**: highlight.js for code exports
- **Search**: Fuse.js for fuzzy searching community patterns
- **Sharing**: QRCode.js for generating shareable QR codes

### Browser Support

Works in all modern browsers:

- Chrome/Edge (Chromium)
- Firefox
- Safari

### Performance

- Client-side only, no server requests
- Optimized regex processing for real-time feedback
- Efficient visualization rendering even for complex patterns

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. Start creating and testing regex patterns!

No build tools or dependencies required for basic usage.

## Deployment

### Local Development
Simply serve the files using a static web server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve
```

### Deploy on Vercel
This project is optimized for deployment on Vercel:

1. Fork or push this repository to your GitHub account
2. Sign up/in on [Vercel](https://vercel.com)
3. Click "New Project" and import your repository
4. Leave all settings at their defaults (automatically detects static site)
5. Click "Deploy"

The site will be deployed to a URL like `https://regexplore.vercel.app` (depending on your project name).

## License

This project is open source under the MIT License.

## Acknowledgements

- Regular expression engine: native JavaScript
- Icons: Font Awesome
- Libraries: vis.js, highlight.js, Fuse.js, QRCode.js, FileSaver.js, marked.js
