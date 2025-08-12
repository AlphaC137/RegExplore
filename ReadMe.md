# RegExplore

> Regex ain’t scary anymore. Welcome to RegExplore.

![App Diagram Flow](/images/flow.png)

RegExplore is a powerful, interactive web application designed to help developers create, test, understand, and visualize regular expressions in real-time. It’s primarily client-side (HTML/CSS/JS). For the Community Patterns feature, simple serverless API routes are provided that read/write a JSON file.

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

## Community Patterns

The Community Patterns feature allows users to share and discover regex patterns created by other developers:

### Using Community Patterns

1. Click on the "Community Patterns" tab to browse available patterns
2. Use the search bar or tag filters to find specific patterns
3. Click on a pattern card to load it into the editor
4. Click the external link icon to view detailed information about the pattern

### Publishing Your Patterns

To share your regex pattern with the community:

1. Create and test your regex pattern in the editor
2. Click the "Publish My Pattern" button
3. Fill in the required information:
   - Pattern Name: A descriptive title
   - Description: Explain what your pattern does and how to use it
   - Tags: Comma-separated categories (e.g., "validation, email, web")
4. Click "Publish Pattern" to share it with the community

### Technical Implementation

The Community Patterns feature uses:

- Serverless API routes to store and retrieve patterns (see `api/`)
- Vercel KV for persistence (preferred) with filesystem JSON fallback for local dev
- Client-side search with Fuse.js for fast filtering

```bash
# API Endpoints
GET /api/patterns           # List all community patterns
GET /api/pattern?id={id}    # Get a specific pattern by ID
POST /api/submit            # Submit a new pattern
```

Notes on persistence and deployment:

- Local dev: open `index.html` directly or serve statically; Community tab will fall back to built-in sample data if the API isn’t reachable. API routes use a JSON file fallback (`api/community-patterns.json`).
- Vercel: the included `vercel.json` maps the API routes. To enable persistence, provision Vercel KV and set the following environment variables in your Project Settings:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
  - `KV_URL` (optional, depending on client)
  The API will automatically use KV when these are present; otherwise it falls back to the JSON file.
- Other hosts: you’ll need a Node runtime capable of running the simple API handlers and writing the JSON file.
