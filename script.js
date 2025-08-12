document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Main UI
    const regexInput = document.getElementById('regex-input');
    const testInput = document.getElementById('test-input');
    const matchCount = document.getElementById('match-count');
    const matchResults = document.getElementById('match-results');
    const regexExplanation = document.getElementById('regex-explanation');
    const regexPlainExplanation = document.getElementById('regex-plain-explanation');
    const patternGrid = document.getElementById('pattern-grid');
    const savedPatterns = document.getElementById('saved-patterns');
    const flagsDisplay = document.getElementById('flags-display');
    const flagCheckboxes = document.querySelectorAll('.flag-options input');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const communityPatternsGrid = document.getElementById('community-patterns-grid');
    const communitySearch = document.getElementById('community-search');
    const communityTags = document.querySelectorAll('.community-patterns-tags .tag');
    const toggleExplanationBtn = document.getElementById('toggle-explanation-mode');
    const toggleCoachBtn = document.getElementById('toggle-coach-btn');
    const regexCoachContainer = document.getElementById('regex-coach-container');
    const regexCoachMessage = document.getElementById('regex-coach-message');
    const visualizerGraph = document.getElementById('visualizer-graph');
    const visualizerLoading = document.getElementById('visualizer-loading');
    
    // DOM Elements - Test Suite Mode
    const toggleTestSuiteBtn = document.getElementById('toggle-test-suite-btn');
    const standardTestMode = document.getElementById('standard-test-mode');
    const testSuiteMode = document.getElementById('test-suite-mode');
    const addTestCaseBtn = document.getElementById('add-test-case-btn');
    const runTestSuiteBtn = document.getElementById('run-test-suite-btn');
    const importTestCasesBtn = document.getElementById('import-test-cases-btn');
    const importTestFile = document.getElementById('import-test-file');
    const testCasesTable = document.getElementById('test-cases-table');
    const testCasesBody = document.getElementById('test-cases-body');
    const testSummary = document.getElementById('test-summary');
    
    // DOM Elements - Export Modal
    const exportRegexBtn = document.getElementById('export-regex-btn');
    const exportModal = document.getElementById('export-modal');
    const closeExportModal = document.getElementById('close-export-modal');
    const exportLanguage = document.getElementById('export-language');
    const exportFormat = document.getElementById('export-format');
    const exportPreviewCode = document.getElementById('export-preview-code');
    const copyExportBtn = document.getElementById('copy-export-btn');
    const downloadExportBtn = document.getElementById('download-export-btn');
    
    // DOM Elements - Share Modal
    const shareRegexBtn = document.getElementById('share-regex-btn');
    const shareModal = document.getElementById('share-modal');
    const closeShareModal = document.getElementById('close-share-modal');
    const shareUrl = document.getElementById('share-url');
    const copyUrlBtn = document.getElementById('copy-url-btn');
    const shareIncludeTest = document.getElementById('share-include-test');
    const shareQrContainer = document.getElementById('share-qr-container');
    
    // DOM Elements - Publish Modal
    const publishPatternBtn = document.getElementById('publish-pattern-btn');
    const publishModal = document.getElementById('publish-modal');
    const closePublishModal = document.getElementById('close-publish-modal');
    const publishName = document.getElementById('publish-name');
    const publishDescription = document.getElementById('publish-description');
    const publishTags = document.getElementById('publish-tags');
    const submitPatternBtn = document.getElementById('submit-pattern-btn');
    
    // Action buttons
    const copyRegexBtn = document.getElementById('copy-regex-btn');
    const saveRegexBtn = document.getElementById('save-regex-btn');
    const clearRegexBtn = document.getElementById('clear-regex-btn');
    
    // State
    let currentRegex = null;
    let savedPatternsArray = [];
    let communityPatternsArray = [];
    let testCasesArray = [];
    let isTestSuiteMode = false;
    let isPlainExplanation = false;
    let isCoachVisible = true;
    let network = null; // for visualizer
    let fuseSearch = null; // for pattern searching
    
    // Initialize the app
    initApp();
    
    // Check for shared regex in URL
    checkForSharedRegex();
    
    function initApp() {
        // Setup event listeners
        setupEventListeners();
        
        // Load saved patterns from localStorage
        loadSavedPatterns();
        
        // Load pattern library
        loadPatternLibrary();
        
        // Load community patterns
        loadCommunityPatterns();
        
        // Load user preferences
        loadUserPreferences();
        
        // Setup initial states
        updateFlagsDisplay();
        
        // Setup export/share functionality
        setupExportFunctionality();
        
        // Initialize libraries
        initializeHighlightJS();
    }
    
    function setupEventListeners() {
        // Debounced handlers to avoid heavy work on every keystroke
        const debouncedProcessAndCoach = debounce(() => {
            processRegex();
            updateCoach();
        }, 200);

        // Main functionality
        regexInput.addEventListener('input', debouncedProcessAndCoach);
        testInput.addEventListener('input', debouncedProcessAndCoach);
        flagCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updateFlagsDisplay();
                debouncedProcessAndCoach();
            });
        });
        
        // Button actions
        copyRegexBtn.addEventListener('click', copyRegexToClipboard);
        saveRegexBtn.addEventListener('click', savePattern);
        clearRegexBtn.addEventListener('click', clearInputs);
        exportRegexBtn.addEventListener('click', openExportModal);
        shareRegexBtn.addEventListener('click', openShareModal);
        
        // Theme toggle
        themeToggleBtn.addEventListener('click', toggleTheme);
        
        // Tab navigation
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                switchTab(tabName);
                
                // If switching to visualizer tab, generate visualization
                if (tabName === 'visualizer') {
                    generateVisualization();
                }
            });
        });
        
        // Explanation toggle
        toggleExplanationBtn.addEventListener('click', toggleExplanationMode);
        
        // Coach toggle
        toggleCoachBtn.addEventListener('click', toggleCoach);
        
        // Test suite mode
        toggleTestSuiteBtn.addEventListener('click', toggleTestSuiteMode);
        addTestCaseBtn.addEventListener('click', addTestCase);
        runTestSuiteBtn.addEventListener('click', runTestSuite);
        importTestCasesBtn.addEventListener('click', () => importTestFile.click());
        importTestFile.addEventListener('change', importTestCases);
        
        // Export modal
        closeExportModal.addEventListener('click', closeModal);
        exportLanguage.addEventListener('change', updateExportPreview);
        exportFormat.addEventListener('change', updateExportPreview);
        copyExportBtn.addEventListener('click', copyExport);
        downloadExportBtn.addEventListener('click', downloadExport);
        
        // Share modal
        closeShareModal.addEventListener('click', closeModal);
        copyUrlBtn.addEventListener('click', copyShareUrl);
        shareIncludeTest.addEventListener('change', updateShareUrl);
        
        // Publish modal
        publishPatternBtn.addEventListener('click', openPublishModal);
        closePublishModal.addEventListener('click', closeModal);
        submitPatternBtn.addEventListener('click', submitCommunityPattern);
        
        // Community patterns
        communitySearch.addEventListener('input', filterCommunityPatterns);
        communityTags.forEach(tag => {
            tag.addEventListener('click', () => {
                document.querySelectorAll('.community-patterns-tags .tag').forEach(t => {
                    t.classList.remove('active');
                });
                tag.classList.add('active');
                filterCommunityPatterns();
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === exportModal || 
                e.target === shareModal || 
                e.target === publishModal) {
                closeModal(e);
            }
        });
    }
    
    // Core functionality
    function processRegex() {
        const pattern = regexInput.value.trim();
        const testText = testInput.value;
        
        if (!pattern) {
            // Reset UI when no pattern is provided
            resetResults();
            return;
        }
        
        try {
            // Get flags
            const flags = getSelectedFlags();
            
            // Create RegExp object
            currentRegex = new RegExp(pattern, flags);
            
            // Process test text
            processTestText(testText);
            
            // Update explanation
            updateExplanation(pattern);
            
            // Clear any previous error states
            regexInput.classList.remove('error');
        } catch (error) {
            // Handle invalid regex
            handleRegexError(error);
        }
    }
    
    function processTestText(text) {
        if (!currentRegex || !text) {
            matchCount.textContent = '0 matches found';
            matchResults.innerHTML = '<p class="empty-state">Enter a regex pattern and test text to see matches.</p>';
            return;
        }
        
        const gFlags = currentRegex.flags.includes('g') ? currentRegex.flags : currentRegex.flags + 'g';
        const globalRegex = new RegExp(currentRegex.source, gFlags);
        const matches = [...text.matchAll(globalRegex)].map(m => ({
            value: m[0],
            index: m.index,
            groups: m.slice(1),
            length: m[0].length
        }));
        
        // Update match count
        const matchCountText = matches.length === 1 ? '1 match found' : `${matches.length} matches found`;
        matchCount.textContent = matchCountText;
        
        // Display highlighted test text
        displayHighlightedText(text, matches);
        
        // Display match details
        displayMatchDetails(matches);
    }
    
    function displayHighlightedText(text, matches) {
        if (matches.length === 0) {
            matchResults.innerHTML = '<p class="empty-state">No matches found in the test text.</p>';
            return;
        }
        
        // Create highlighted HTML
        let html = '<div class="match-results-container">';
        html += '<h3>Highlighted Text:</h3>';
        html += '<div class="highlighted-text">';
        
        let lastIndex = 0;
        matches.forEach((match, index) => {
            // Add text before the match
            html += escapeHtml(text.substring(lastIndex, match.index));
            
            // Add highlighted match
            html += `<mark class="match-highlight" data-match-index="${index}">${escapeHtml(match.value)}</mark>`;
            
            lastIndex = match.index + match.length;
        });
        
        // Add remaining text after last match
        html += escapeHtml(text.substring(lastIndex));
        html += '</div></div>';
        
        matchResults.innerHTML = html;
    }
    
    function displayMatchDetails(matches) {
        if (matches.length === 0) return;
        
        let html = '<div class="match-details-container mt-2">';
        html += '<h3>Match Details:</h3>';
        html += '<div class="match-details">';
        
        matches.forEach((match, index) => {
            html += `
                <div class="match-detail-item">
                    <div class="match-header">
                        <strong>Match ${index + 1}:</strong>
                        <span class="match-position">position ${match.index}</span>
                    </div>
                    <div class="match-value">"${escapeHtml(match.value)}"</div>
                `;
            
            if (match.groups.length > 0) {
                html += '<div class="match-groups">';
                html += '<strong>Capturing Groups:</strong>';
                html += '<ul>';
                match.groups.forEach((group, groupIndex) => {
                    html += `<li>Group ${groupIndex + 1}: "${escapeHtml(group || '')}"</li>`;
                });
                html += '</ul></div>';
            }
            
            html += '</div>';
        });
        
        html += '</div></div>';
        
        // Append to existing content
        matchResults.innerHTML += html;
    }
    
    // Technical Explanation
    function updateExplanation(pattern) {
        if (!pattern) {
            regexExplanation.innerHTML = '<p class="empty-state">Enter a regex pattern to see its explanation.</p>';
            regexPlainExplanation.innerHTML = '<p class="empty-state">Enter a regex pattern to see its plain English explanation.</p>';
            return;
        }
        
        // Technical explanation
    const technicalExplanation = explainRegexTechnical(pattern);
        regexExplanation.innerHTML = technicalExplanation;
        
        // Plain English explanation
    const plainExplanation = explainRegexPlainEnglish(pattern);
    regexPlainExplanation.innerHTML = plainExplanation;
        
        // Show the appropriate explanation based on current mode
        if (isPlainExplanation) {
            regexExplanation.classList.add('hidden');
            regexPlainExplanation.classList.remove('hidden');
        } else {
            regexExplanation.classList.remove('hidden');
            regexPlainExplanation.classList.add('hidden');
        }
    }
    
    function explainRegexTechnical(pattern) {
        let html = '<div class="explanation-container">';
        
        try {
            const tokenizedPattern = tokenizeRegex(pattern);
            
            // Introduction
            html += `<p>This regular expression contains ${tokenizedPattern.length} main components:</p>`;
            
            // Detailed explanation of each component
            html += '<div class="explanation-components">';
            tokenizedPattern.forEach((token, index) => {
                html += `
                    <div class="explanation-item">
                        <div class="explanation-token">
                            <span class="token">${escapeHtml(token.value)}</span>
                        </div>
                        <div class="explanation-meaning">
                            ${escapeHtml(token.explanation)}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            // Add flags explanation if any
            const flags = getSelectedFlags();
            if (flags) {
                html += '<div class="explanation-flags mt-2">';
                html += '<h4>Flags Explanation:</h4>';
                html += '<ul>';
                if (flags.includes('g')) html += '<li><strong>g</strong> (global): Find all matches rather than stopping after the first match.</li>';
                if (flags.includes('i')) html += '<li><strong>i</strong> (case insensitive): Ignore case when matching.</li>';
                if (flags.includes('m')) html += '<li><strong>m</strong> (multiline): ^ and $ match at the beginning and end of each line, not just the beginning and end of the string.</li>';
                if (flags.includes('s')) html += '<li><strong>s</strong> (dotAll): . matches newline characters as well.</li>';
                if (flags.includes('u')) html += '<li><strong>u</strong> (unicode): Treat pattern as a sequence of Unicode code points.</li>';
                if (flags.includes('y')) html += '<li><strong>y</strong> (sticky): Matches only from the index indicated by the lastIndex property of this regular expression in the target string.</li>';
                html += '</ul>';
                html += '</div>';
            }
            
        } catch (error) {
            html += `<p class="error">Could not explain this pattern: ${error.message}</p>`;
        }
        
        html += '</div>';
        return html;
    }
    
    // Plain English Explanation
    function explainRegexPlainEnglish(pattern) {
        let html = '<div class="explanation-container">';
        
        try {
            // Generate a human-readable explanation
            const explanation = generatePlainEnglishExplanation(pattern);
            
            html += `<p class="plain-explanation">${explanation}</p>`;
            
            // Add an example of what it matches
            html += '<div class="explanation-examples mt-2">';
            html += '<h4>What This Might Match:</h4>';
            
            const examples = generateExamples(pattern);
            if (examples.length > 0) {
                html += '<ul>';
                examples.forEach(example => {
                    html += `<li>"${escapeHtml(example)}"</li>`;
                });
                html += '</ul>';
            } else {
                html += '<p>Could not generate example matches for this pattern.</p>';
            }
            html += '</div>';
            
        } catch (error) {
            html += `<p class="error">Could not generate plain English explanation: ${error.message}</p>`;
        }
        
        html += '</div>';
        return html;
    }
    
    function generatePlainEnglishExplanation(pattern) {
        // This is a simplified version - a full implementation would be more complex
        let explanation = "";
        
        try {
            const tokens = tokenizeRegex(pattern);
            
            // Analyze pattern components
            const hasStartAnchor = tokens.some(t => t.value === "^");
            const hasEndAnchor = tokens.some(t => t.value === "$");
            const hasGroups = tokens.some(t => t.type === "groupOpen");
            const hasAlternation = tokens.some(t => t.value === "|");
            const hasQuantifiers = tokens.some(t => t.type === "quantifier");
            const hasCharacterClasses = tokens.some(t => t.type === "characterClass");
            
            // Start building the explanation
            if (hasStartAnchor && hasEndAnchor) {
                explanation += "This pattern matches a complete string that ";
            } else if (hasStartAnchor) {
                explanation += "This pattern matches text at the beginning of a string that ";
            } else if (hasEndAnchor) {
                explanation += "This pattern matches text at the end of a string that ";
            } else {
                explanation += "This pattern matches any text that ";
            }
            
            // Simple analysis of what the pattern does
            if (hasGroups && hasAlternation) {
                explanation += "contains specific grouped alternatives. ";
            } else if (hasGroups) {
                explanation += "contains specific captured groups. ";
            } else if (hasAlternation) {
                explanation += "contains one of several alternatives. ";
            } else {
                explanation += "follows a specific sequence. ";
            }
            
            // Add details about the components
            let components = [];
            
            if (/\\d/.test(pattern)) components.push("digits");
            if (/\\w/.test(pattern)) components.push("word characters (letters, numbers, underscore)");
            if (/\\s/.test(pattern)) components.push("whitespace");
            if (/[a-z]/i.test(pattern)) components.push("letters");
            if (/[0-9]/.test(pattern)) components.push("numbers");
            if (/@/.test(pattern)) components.push("@ symbol");
            if (/\./.test(pattern)) components.push("periods");
            
            if (components.length > 0) {
                explanation += "It looks for " + listToEnglish(components) + ". ";
            }
            
            // Mention quantifiers if present
            if (hasQuantifiers) {
                explanation += "The pattern uses repetition to match varying lengths. ";
                if (pattern.includes("+")) explanation += "Some elements must appear one or more times. ";
                if (pattern.includes("*")) explanation += "Some elements may appear zero or more times. ";
                if (pattern.includes("?")) explanation += "Some elements are optional. ";
            }
            
            // Common pattern recognition
            if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(pattern)) {
                explanation = "This pattern matches email addresses, requiring a username, @ symbol, domain name, and top-level domain.";
            } else if (/^(https?:\/\/)/.test(pattern)) {
                explanation = "This pattern matches URLs starting with http:// or https://.";
            } else if (/^\d{3}-\d{3}-\d{4}$/.test(pattern)) {
                explanation = "This pattern matches phone numbers in the format XXX-XXX-XXXX.";
            } else if (/^\d{4}-\d{2}-\d{2}$/.test(pattern)) {
                explanation = "This pattern matches dates in the format YYYY-MM-DD.";
            }
            
        } catch (error) {
            explanation = "This regex is too complex to give a simple English explanation.";
        }
        
        return explanation;
    }
    
    function generateExamples(pattern) {
        // This is a very simplified example generator
        // A real implementation would be more sophisticated
        const examples = [];
        
        try {
            // Common pattern examples
            if (/\\d{3}-\\d{3}-\\d{4}/.test(pattern)) {
                examples.push("123-456-7890");
            }
            
            if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(pattern)) {
                examples.push("example@email.com");
                examples.push("john.doe123@company-name.co.uk");
            }
            
            if (/https?:\/\/\S+/.test(pattern)) {
                examples.push("https://www.example.com");
                examples.push("http://subdomain.site.net/path?query=value");
            }
            
            if (/\d{4}-\d{2}-\d{2}/.test(pattern)) {
                examples.push("2025-06-08");
            }
            
            if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(pattern)) {
                examples.push("#FF0000");
                examples.push("#09C");
            }
            
            // If we couldn't match any known patterns, try to generate a simple example
            if (examples.length === 0) {
                let example = "";
                
                // Replace common regex tokens with example values
                const simplifiedPattern = pattern
                    .replace(/\\d/g, "5")
                    .replace(/\\w/g, "a")
                    .replace(/\\s/g, " ")
                    .replace(/[0-9]/g, "7")
                    .replace(/[a-z]/gi, "x")
                    .replace(/[A-Z]/g, "X")
                    .replace(/\[\^.*?\]/g, "!") // negated character classes
                    .replace(/\{\d+,\d+\}/g, "") // Remove quantifiers like {2,5}
                    .replace(/\{\d+\}/g, "") // Remove quantifiers like {2}
                    .replace(/[+*?]/g, "") // Remove + * ?
                    .replace(/[\^\$]/g, "") // Remove anchors
                    .replace(/\(\?:.*?\)/g, "group") // Non-capturing groups
                    .replace(/\(.*?\)/g, "group"); // Capturing groups
                
                // Very simple example generation
                for (let i = 0; i < simplifiedPattern.length; i++) {
                    if (simplifiedPattern[i] === "\\") {
                        // Skip escape character
                        i++;
                    } else if (simplifiedPattern[i] !== "(" && 
                               simplifiedPattern[i] !== ")" && 
                               simplifiedPattern[i] !== "[" && 
                               simplifiedPattern[i] !== "]" && 
                               simplifiedPattern[i] !== "|") {
                        example += simplifiedPattern[i];
                    }
                }
                
                if (example) {
                    examples.push(example);
                }
            }
            
        } catch (error) {
            // Return empty array if we can't generate examples
        }
        
        return examples;
    }
    
    function tokenizeRegex(pattern) {
        // This is a simplified tokenizer for demonstration purposes
        // A complete tokenizer would be more complex
        
        const tokens = [];
        let i = 0;
        
        while (i < pattern.length) {
            // Character classes
            if (pattern[i] === '[') {
                const startIndex = i;
                i++;
                let isEscaped = false;
                
                // Find the closing bracket, accounting for escapes
                while (i < pattern.length) {
                    if (pattern[i] === ']' && !isEscaped) {
                        break;
                    }
                    isEscaped = pattern[i] === '\\' && !isEscaped;
                    i++;
                }
                
                if (i < pattern.length) {
                    i++; // Include the closing bracket
                }
                
                const value = pattern.substring(startIndex, i);
                tokens.push({
                    type: 'characterClass',
                    value,
                    explanation: explainCharacterClass(value)
                });
                
            // Quantifiers
            } else if ('*+?{'.includes(pattern[i])) {
                const startIndex = i;
                i++;
                
                // For {n,m} quantifier
                if (pattern[i-1] === '{') {
                    while (i < pattern.length && pattern[i] !== '}') {
                        i++;
                    }
                    if (i < pattern.length) {
                        i++; // Include the closing brace
                    }
                }
                
                const value = pattern.substring(startIndex, i);
                tokens.push({
                    type: 'quantifier',
                    value,
                    explanation: explainQuantifier(value)
                });
                
            // Groups and alternation
            } else if (pattern[i] === '(' || pattern[i] === ')' || pattern[i] === '|') {
                const value = pattern[i];
                tokens.push({
                    type: value === '(' ? 'groupOpen' : 
                           value === ')' ? 'groupClose' : 'alternation',
                    value,
                    explanation: value === '(' ? 'Begins a capturing group.' : 
                                 value === ')' ? 'Ends a capturing group.' : 
                                 'Alternation (OR operator) - matches the expression before or after the |.'
                });
                i++;
                
            // Escaped characters
            } else if (pattern[i] === '\\') {
                const startIndex = i;
                i += 2; // Skip the escape and the escaped character
                
                const value = pattern.substring(startIndex, i);
                tokens.push({
                    type: 'escapedChar',
                    value,
                    explanation: explainEscapedChar(value)
                });
                
            // Anchors and other special characters
            } else if ('^$.*+?()[]{}|\\'.includes(pattern[i])) {
                const value = pattern[i];
                tokens.push({
                    type: 'special',
                    value,
                    explanation: explainSpecialChar(value)
                });
                i++;
                
            // Normal characters
            } else {
                let j = i;
                while (j < pattern.length && !'\\^$.*+?()[]{}|'.includes(pattern[j])) {
                    j++;
                }
                
                const value = pattern.substring(i, j);
                tokens.push({
                    type: 'literal',
                    value,
                    explanation: `Matches the literal string "${value}".`
                });
                i = j;
            }
        }
        
        return tokens;
    }
    
    // Helper functions for regex explanation
    function explainCharacterClass(value) {
        if (value === '\\d') return 'Matches any digit (0-9).';
        if (value === '\\w') return 'Matches any word character (alphanumeric + underscore).';
        if (value === '\\s') return 'Matches any whitespace character (spaces, tabs, line breaks).';
        
        // For custom character classes like [a-z]
        if (value.startsWith('[') && value.endsWith(']')) {
            const content = value.substring(1, value.length - 1);
            
            // Negated character class [^...]
            if (content.startsWith('^')) {
                return `Defines a negated character class that matches any single character NOT in the set ${value}.`;
            }
            
            return `Defines a character class that matches any single character from the set ${value}.`;
        }
        
        return `Character class: ${value}`;
    }
    
    function explainQuantifier(value) {
        if (value === '*') return 'Matches 0 or more of the preceding element.';
        if (value === '+') return 'Matches 1 or more of the preceding element.';
        if (value === '?') return 'Matches 0 or 1 of the preceding element (makes it optional).';
        
        // For {n}, {n,}, {n,m}
        if (value.startsWith('{')) {
            const inner = value.substring(1, value.length - 1);
            if (inner.includes(',')) {
                const [min, max] = inner.split(',');
                if (max === '') {
                    return `Matches at least ${min} of the preceding element.`;
                } else {
                    return `Matches between ${min} and ${max} of the preceding element.`;
                }
            } else {
                return `Matches exactly ${inner} of the preceding element.`;
            }
        }
        
        return `Quantifier: ${value}`;
    }
    
    function explainEscapedChar(value) {
        const char = value[1];
        
        // Common escaped characters
        if (char === 'd') return 'Matches any digit (0-9).';
        if (char === 'w') return 'Matches any word character (alphanumeric + underscore).';
        if (char === 's') return 'Matches any whitespace character (spaces, tabs, line breaks).';
        if (char === 'b') return 'Matches a word boundary.';
        if (char === 'D') return 'Matches any non-digit character.';
        if (char === 'W') return 'Matches any non-word character.';
        if (char === 'S') return 'Matches any non-whitespace character.';
        
        // Escaped special characters
        if ('[](){}.*+?^$|\\'.includes(char)) {
            return `Matches the literal character "${char}".`;
        }
        
        return `Matches the escaped character "${char}".`;
    }
    
    function explainSpecialChar(value) {
        if (value === '^') return 'Matches the beginning of the string, or the beginning of a line when the multiline flag is used.';
        if (value === '$') return 'Matches the end of the string, or the end of a line when the multiline flag is used.';
        if (value === '.') return 'Matches any character except newline characters.';
        
        return `Special character: ${value}`;
    }
    
    // Helper function to convert array to English list
    function listToEnglish(items) {
        if (items.length === 0) return "";
        if (items.length === 1) return items[0];
        if (items.length === 2) return items.join(" and ");
        
        const lastItem = items.pop();
        return items.join(", ") + ", and " + lastItem;
    }
    
    // Toggle explanation mode between technical and plain English
    function toggleExplanationMode() {
        isPlainExplanation = !isPlainExplanation;
        
        if (isPlainExplanation) {
            regexExplanation.classList.add('hidden');
            regexPlainExplanation.classList.remove('hidden');
            toggleExplanationBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Show Technical Explanation';
        } else {
            regexExplanation.classList.remove('hidden');
            regexPlainExplanation.classList.add('hidden');
            toggleExplanationBtn.innerHTML = '<i class="fas fa-exchange-alt"></i> Show Plain English';
        }
    }
    
    // Regex Coach functionality
    function updateCoach() {
        if (!isCoachVisible) return;
        
        const pattern = regexInput.value.trim();
        if (!pattern) {
            regexCoachMessage.innerHTML = 'Enter a regular expression to get started!';
            return;
        }
        
        try {
            // Try to create the RegExp object to check validity
            const flags = getSelectedFlags();
            new RegExp(pattern, flags);
            
            // Provide tips based on pattern analysis
            const tips = analyzePatternForTips(pattern, flags);
            
            if (tips.length > 0) {
                regexCoachMessage.innerHTML = tips.join('<br>');
            } else {
                regexCoachMessage.innerHTML = 'Your regex looks good! Try testing it against some input.';
            }
        } catch (error) {
            regexCoachMessage.innerHTML = `<span class="error">Invalid regex: ${error.message}</span>`;
        }
    }
    
    function analyzePatternForTips(pattern, flags) {
        const tips = [];
        
        // Check for common issues and improvements
        if (pattern.includes(' ') && !pattern.includes('\\ ')) {
            tips.push('<span class="warning"><i class="fas fa-exclamation-triangle"></i> Your pattern contains spaces. Did you mean to escape them like "\\s" or "\\ "?</span>');
        }
        
        if (/[a-zA-Z]/.test(pattern) && !flags.includes('i') && !pattern.includes('[') && !pattern.includes('\\')) {
            tips.push('<span class="info"><i class="fas fa-info-circle"></i> Consider adding the "i" flag for case-insensitive matching.</span>');
        }
        
        if (pattern.includes('.') && !pattern.includes('\\.') && !flags.includes('s')) {
            tips.push('<span class="info"><i class="fas fa-info-circle"></i> The dot "." matches any character except newlines. Add the "s" flag to match newlines too.</span>');
        }
        
        if (pattern.endsWith('*') || pattern.endsWith('+')) {
            tips.push('<span class="warning"><i class="fas fa-exclamation-triangle"></i> Greedy quantifiers (* or +) at the end can be performance-intensive on large inputs.</span>');
        }
        
        if (/\(\?:/.test(pattern)) {
            tips.push('<span class="success"><i class="fas fa-check-circle"></i> Good use of non-capturing groups for better performance!</span>');
        }
        
        if (pattern.includes('{') && !pattern.includes('\\{')) {
            // Check if the curly braces form a valid quantifier
            const braceMatch = pattern.match(/{(\d+)(,(\d+)?)?}/);
            if (!braceMatch) {
                tips.push('<span class="warning"><i class="fas fa-exclamation-triangle"></i> Check your curly braces syntax for quantifiers.</span>');
            }
        }
        
        if (!flags.includes('g') && pattern.length > 1) {
            tips.push('<span class="info"><i class="fas fa-info-circle"></i> Without the "g" flag, only the first match will be found.</span>');
        }
        
        // Check for potentially unintended character class ranges
        if (/\[[^\]]*?[a-z][A-Z][^\]]*?\]/i.test(pattern)) {
            tips.push('<span class="warning"><i class="fas fa-exclamation-triangle"></i> Be careful with character ranges. [a-Z] includes more than just letters.</span>');
        }
        
        // Potential optimization tips
        if (/\([^)]+\)\??/.test(pattern)) {
            tips.push('<span class="info"><i class="fas fa-lightbulb"></i> Consider using (?:...) for non-capturing groups if you don\'t need to reference the match.</span>');
        }
        
        // Check for common regex patterns
        if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(pattern)) {
            tips.push('<span class="success"><i class="fas fa-check-circle"></i> This looks like an email validation pattern.</span>');
        } else if (/https?:\/\//.test(pattern)) {
            tips.push('<span class="success"><i class="fas fa-check-circle"></i> This looks like a URL matching pattern.</span>');
        }
        
        return tips;
    }
    
    function toggleCoach() {
        isCoachVisible = !isCoachVisible;
        
        if (isCoachVisible) {
            regexCoachContainer.style.display = 'flex';
            toggleCoachBtn.innerHTML = '<i class="fas fa-times"></i>';
            updateCoach();
        } else {
            regexCoachContainer.style.display = 'none';
            toggleCoachBtn.innerHTML = '<i class="fas fa-lightbulb"></i>';
        }
    }
    
    // Regex Visualizer
    function generateVisualization() {
        const pattern = regexInput.value.trim();
        
        if (!pattern) {
            visualizerGraph.innerHTML = '<div class="empty-state">Enter a regex pattern to see its visualization.</div>';
            visualizerLoading.style.display = 'none';
            return;
        }
        
        // Show loading indicator
        visualizerLoading.style.display = 'block';
        
        try {
            // Parse the regex and create a visualization
            setTimeout(() => {
                try {
                    createRegexGraph(pattern);
                    visualizerLoading.style.display = 'none';
                } catch (error) {
                    visualizerGraph.innerHTML = `<div class="error">Could not visualize regex: ${error.message}</div>`;
                    visualizerLoading.style.display = 'none';
                }
            }, 100); // Small timeout to ensure the loading indicator shows
        } catch (error) {
            visualizerGraph.innerHTML = `<div class="error">Could not visualize regex: ${error.message}</div>`;
            visualizerLoading.style.display = 'none';
        }
    }
    
    function createRegexGraph(pattern) {
        // Parse regex into nodes and edges
        const { nodes, edges } = parseRegexForVisualization(pattern);
        
        // Create a network
        const container = visualizerGraph;
        
        // Provide the data in the vis format
        const data = {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges)
        };
        
        // Options for the network visualization
        const options = {
            nodes: {
                shape: 'box',
                margin: 10,
                font: {
                    size: 14
                },
                borderWidth: 2,
                shadow: true
            },
            edges: {
                width: 2,
                arrows: 'to',
                smooth: {
                    type: 'curvedCW',
                    roundness: 0.2
                }
            },
            layout: {
                hierarchical: {
                    direction: 'LR',
                    sortMethod: 'directed',
                    nodeSpacing: 150,
                    levelSeparation: 150
                }
            },
            physics: {
                hierarchicalRepulsion: {
                    nodeDistance: 160
                },
                solver: 'hierarchicalRepulsion'
            },
            interaction: {
                dragNodes: true,
                hover: true,
                tooltipDelay: 200
            }
        };
        
        // Initialize the network
        if (network) {
            network.destroy();
        }
        network = new vis.Network(container, data, options);
        
        // Add hover events for tooltips
        network.on("hoverNode", function(params) {
            const nodeId = params.node;
            const node = nodes.find(n => n.id === nodeId);
            if (node && node.title) {
                showTooltip(node.title, params.event.pageX, params.event.pageY);
            }
        });
        
        network.on("blurNode", function() {
            hideTooltip();
        });
    }
    
    function parseRegexForVisualization(pattern) {
        // This is a simplified parser for visualization
        const nodes = [];
        const edges = [];
        
        let nodeId = 1;
        let nextNodeId = 2;
        let startNodeId = 1;
        
        // Add start node
        nodes.push({
            id: nodeId,
            label: "Start",
            color: { background: '#4CAF50', border: '#388E3C' },
            title: "Start of regex"
        });
        
        // Parse the pattern
        let i = 0;
        let groupStack = [];
        let lastNodeInSequence = startNodeId;
        
        while (i < pattern.length) {
            let currentToken = "";
            let tokenType = "";
            let tooltip = "";
            
            // Determine token type
            if (pattern[i] === '(') {
                // Start of group
                currentToken = "(";
                tokenType = "group";
                tooltip = "Start of capturing group";
                i++;
                
                const groupStartNodeId = nextNodeId++;
                nodes.push({
                    id: groupStartNodeId,
                    label: "(",
                    color: { background: '#E1BEE7', border: '#8E24AA' },
                    title: tooltip
                });
                
                edges.push({
                    from: lastNodeInSequence,
                    to: groupStartNodeId
                });
                
                groupStack.push({
                    startNodeId: groupStartNodeId,
                    endNodeId: null
                });
                
                lastNodeInSequence = groupStartNodeId;
            } else if (pattern[i] === ')') {
                // End of group
                currentToken = ")";
                tokenType = "group";
                tooltip = "End of capturing group";
                i++;
                
                const groupEndNodeId = nextNodeId++;
                nodes.push({
                    id: groupEndNodeId,
                    label: ")",
                    color: { background: '#E1BEE7', border: '#8E24AA' },
                    title: tooltip
                });
                
                edges.push({
                    from: lastNodeInSequence,
                    to: groupEndNodeId
                });
                
                if (groupStack.length > 0) {
                    const group = groupStack.pop();
                    group.endNodeId = groupEndNodeId;
                }
                
                lastNodeInSequence = groupEndNodeId;
            } else if (pattern[i] === '[') {
                // Character class
                const startIndex = i;
                i++;
                while (i < pattern.length && pattern[i] !== ']') {
                    if (pattern[i] === '\\') {
                        i += 2; // Skip escape and the escaped character
                    } else {
                        i++;
                    }
                }
                if (i < pattern.length) {
                    i++; // Include closing bracket
                }
                
                currentToken = pattern.substring(startIndex, i);
                tokenType = "characterClass";
                tooltip = `Character class: matches any one character from ${currentToken}`;
                
                const nodeId = nextNodeId++;
                nodes.push({
                    id: nodeId,
                    label: currentToken,
                    color: { background: '#BBDEFB', border: '#1976D2' },
                    title: tooltip
                });
                
                edges.push({
                    from: lastNodeInSequence,
                    to: nodeId
                });
                
                lastNodeInSequence = nodeId;
            } else if ('*+?{'.includes(pattern[i])) {
                // Quantifiers
                const startIndex = i;
                i++;
                
                // For {n,m} quantifier
                if (pattern[startIndex] === '{') {
                    while (i < pattern.length && pattern[i] !== '}') {
                        i++;
                    }
                    if (i < pattern.length) {
                        i++; // Include closing brace
                    }
                }
                
                currentToken = pattern.substring(startIndex, i);
                tokenType = "quantifier";
                tooltip = "Quantifier: specifies repetition";
                
                const nodeId = nextNodeId++;
                nodes.push({
                    id: nodeId,
                    label: currentToken,
                    color: { background: '#FFCCBC', border: '#E64A19' },
                    title: tooltip
                });
                
                edges.push({
                    from: lastNodeInSequence,
                    to: nodeId
                });
                
                lastNodeInSequence = nodeId;
            } else if (pattern[i] === '|') {
                // Alternation
                currentToken = "|";
                tokenType = "alternation";
                tooltip = "Alternation (OR operator)";
                i++;
                
                const nodeId = nextNodeId++;
                nodes.push({
                    id: nodeId,
                    label: currentToken,
                    color: { background: '#FFF9C4', border: '#FBC02D' },
                    title: tooltip
                });
                
                edges.push({
                    from: lastNodeInSequence,
                    to: nodeId
                });
                
                lastNodeInSequence = nodeId;
            } else if (pattern[i] === '\\') {
                // Escaped character
                const startIndex = i;
                i += 2; // Skip escape character and the escaped character
                
                currentToken = pattern.substring(startIndex, i);
                tokenType = "escapedChar";
                tooltip = "Escaped character";
                
                const nodeId = nextNodeId++;
                nodes.push({
                    id: nodeId,
                    label: currentToken,
                    color: { background: '#C8E6C9', border: '#388E3C' },
                    title: tooltip
                });
                
                edges.push({
                    from: lastNodeInSequence,
                    to: nodeId
                });
                
                lastNodeInSequence = nodeId;
            } else if (pattern[i] === '^' || pattern[i] === '$') {
                // Anchors
                currentToken = pattern[i];
                tokenType = "anchor";
                tooltip = pattern[i] === '^' ? "Start of line/string anchor" : "End of line/string anchor";
                i++;
                
                const nodeId = nextNodeId++;
                nodes.push({
                    id: nodeId,
                    label: currentToken,
                    color: { background: '#B3E5FC', border: '#0288D1' },
                    title: tooltip
                });
                
                edges.push({
                    from: lastNodeInSequence,
                    to: nodeId
                });
                
                lastNodeInSequence = nodeId;
            } else if (pattern[i] === '.') {
                // Dot (any character)
                currentToken = ".";
                tokenType = "special";
                tooltip = "Any character except newline";
                i++;
                
                const nodeId = nextNodeId++;
                nodes.push({
                    id: nodeId,
                    label: currentToken,
                    color: { background: '#B3E5FC', border: '#0288D1' },
                    title: tooltip
                });
                
                edges.push({
                    from: lastNodeInSequence,
                    to: nodeId
                });
                
                lastNodeInSequence = nodeId;
            } else {
                // Literal character
                currentToken = pattern[i];
                tokenType = "literal";
                tooltip = `Literal character: "${pattern[i]}"`;
                i++;
                
                const nodeId = nextNodeId++;
                nodes.push({
                    id: nodeId,
                    label: currentToken,
                    color: { background: '#DCEDC8', border: '#689F38' },
                    title: tooltip
                });
                
                edges.push({
                    from: lastNodeInSequence,
                    to: nodeId
                });
                
                lastNodeInSequence = nodeId;
            }
        }
        
        // Add end node
        const endNodeId = nextNodeId++;
        nodes.push({
            id: endNodeId,
            label: "End",
            color: { background: '#EF5350', border: '#D32F2F' },
            title: "End of regex"
        });
        
        edges.push({
            from: lastNodeInSequence,
            to: endNodeId
        });
        
        return { nodes, edges };
    }
    
    // Tooltip functionality for the visualizer
    function showTooltip(text, x, y) {
        let tooltip = document.getElementById('vis-tooltip');
        
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'vis-tooltip';
            tooltip.style.position = 'absolute';
            tooltip.style.padding = '5px 8px';
            tooltip.style.backgroundColor = 'rgba(0,0,0,0.7)';
            tooltip.style.color = '#fff';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '12px';
            tooltip.style.zIndex = '1000';
            document.body.appendChild(tooltip);
        }
        
        tooltip.innerHTML = text;
        tooltip.style.left = (x + 10) + 'px';
        tooltip.style.top = (y + 10) + 'px';
        tooltip.style.display = 'block';
    }
    
    function hideTooltip() {
        const tooltip = document.getElementById('vis-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
    
    // Test Suite Mode
    function toggleTestSuiteMode() {
        isTestSuiteMode = !isTestSuiteMode;
        
        if (isTestSuiteMode) {
            standardTestMode.classList.add('hidden');
            testSuiteMode.classList.remove('hidden');
            toggleTestSuiteBtn.innerHTML = '<i class="fas fa-keyboard"></i> Standard Mode';
            
            // Load any saved test cases
            loadTestCases();
        } else {
            standardTestMode.classList.remove('hidden');
            testSuiteMode.classList.add('hidden');
            toggleTestSuiteBtn.innerHTML = '<i class="fas fa-vials"></i> Test Suite Mode';
        }
    }
    
    function addTestCase() {
        const id = generateId();
        const newTestCase = {
            id,
            testString: '',
            expectedMatch: true
        };
        
        testCasesArray.push(newTestCase);
        renderTestCase(newTestCase);
        saveTestCases();
    }
    
    function renderTestCase(testCase) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', testCase.id);
        
        row.innerHTML = `
            <td>
                <input type="text" class="test-string" value="${escapeHtml(testCase.testString)}">
            </td>
            <td>
                <select class="test-expected">
                    <option value="true" ${testCase.expectedMatch ? 'selected' : ''}>Should Match</option>
                    <option value="false" ${!testCase.expectedMatch ? 'selected' : ''}>Should NOT Match</option>
                </select>
            </td>
            <td class="test-result">
                <span>Not tested</span>
            </td>
            <td>
                <div class="test-actions">
                    <button class="test-run-btn" title="Run this test"><i class="fas fa-play"></i></button>
                    <button class="test-delete-btn" title="Delete this test"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        testCasesBody.appendChild(row);
        
        // Add event listeners to this row
        const testStringInput = row.querySelector('.test-string');
        const testExpectedSelect = row.querySelector('.test-expected');
        const testRunBtn = row.querySelector('.test-run-btn');
        const testDeleteBtn = row.querySelector('.test-delete-btn');
        
        testStringInput.addEventListener('change', () => {
            const caseId = row.getAttribute('data-id');
            const testCase = testCasesArray.find(c => c.id === caseId);
            if (testCase) {
                testCase.testString = testStringInput.value;
                saveTestCases();
            }
        });
        
        testExpectedSelect.addEventListener('change', () => {
            const caseId = row.getAttribute('data-id');
            const testCase = testCasesArray.find(c => c.id === caseId);
            if (testCase) {
                testCase.expectedMatch = testExpectedSelect.value === 'true';
                saveTestCases();
            }
        });
        
        testRunBtn.addEventListener('click', () => {
            const caseId = row.getAttribute('data-id');
            runSingleTest(caseId);
        });
        
        testDeleteBtn.addEventListener('click', () => {
            const caseId = row.getAttribute('data-id');
            deleteTestCase(caseId);
        });
    }
    
    function runTestSuite() {
        if (testCasesArray.length === 0) {
            testSummary.innerHTML = 'No test cases to run. Add some test cases first.';
            return;
        }
        
        const pattern = regexInput.value.trim();
        if (!pattern) {
            testSummary.innerHTML = '<span class="error">Please enter a regex pattern first.</span>';
            return;
        }
        
        try {
            const flags = getSelectedFlags();
            const regex = new RegExp(pattern, flags);
            
            let passCount = 0;
            let failCount = 0;
            
            testCasesArray.forEach(testCase => {
                const row = testCasesBody.querySelector(`tr[data-id="${testCase.id}"]`);
                const resultCell = row.querySelector('.test-result');
                
                const isMatch = regex.test(testCase.testString);
                const isPassing = isMatch === testCase.expectedMatch;
                
                if (isPassing) {
                    passCount++;
                    row.className = 'test-row-pass';
                    resultCell.innerHTML = '<span class="test-result pass">PASS</span>';
                } else {
                    failCount++;
                    row.className = 'test-row-fail';
                    resultCell.innerHTML = '<span class="test-result fail">FAIL</span>';
                }
            });
            
            // Update summary
            testSummary.innerHTML = `
                Test results: 
                <strong class="success">${passCount} passed</strong>, 
                <strong class="error">${failCount} failed</strong> 
                (${testCasesArray.length} total)
            `;
            
        } catch (error) {
            testSummary.innerHTML = `<span class="error">Invalid regex: ${error.message}</span>`;
        }
    }
    
    function runSingleTest(testCaseId) {
        const testCase = testCasesArray.find(c => c.id === testCaseId);
        if (!testCase) return;
        
        const pattern = regexInput.value.trim();
        if (!pattern) {
            showNotification('Please enter a regex pattern first', 'error');
            return;
        }
        
        try {
            const flags = getSelectedFlags();
            const regex = new RegExp(pattern, flags);
            
            const row = testCasesBody.querySelector(`tr[data-id="${testCaseId}"]`);
            const resultCell = row.querySelector('.test-result');
            
            const isMatch = regex.test(testCase.testString);
            const isPassing = isMatch === testCase.expectedMatch;
            
            if (isPassing) {
                row.className = 'test-row-pass';
                resultCell.innerHTML = '<span class="test-result pass">PASS</span>';
            } else {
                row.className = 'test-row-fail';
                resultCell.innerHTML = '<span class="test-result fail">FAIL</span>';
            }
            
        } catch (error) {
            showNotification(`Invalid regex: ${error.message}`, 'error');
        }
    }
    
    function deleteTestCase(testCaseId) {
        testCasesArray = testCasesArray.filter(c => c.id !== testCaseId);
        
        const row = testCasesBody.querySelector(`tr[data-id="${testCaseId}"]`);
        if (row) {
            row.remove();
        }
        
        saveTestCases();
    }
    
    function loadTestCases() {
        const savedTestCases = localStorage.getItem('regexTestCases');
        if (savedTestCases) {
            testCasesArray = JSON.parse(savedTestCases);
            
            // Clear existing test cases
            testCasesBody.innerHTML = '';
            
            // Render each test case
            testCasesArray.forEach(testCase => {
                renderTestCase(testCase);
            });
        }
    }
    
    function saveTestCases() {
        localStorage.setItem('regexTestCases', JSON.stringify(testCasesArray));
    }
    
    function importTestCases(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                let imported;
                
                if (file.name.endsWith('.json')) {
                    imported = JSON.parse(e.target.result);
                } else if (file.name.endsWith('.csv')) {
                    imported = parseCSV(e.target.result);
                } else {
                    // Assume it's a text file with one test per line
                    imported = parseTextFile(e.target.result);
                }
                
                if (Array.isArray(imported) && imported.length > 0) {
                    // Clear existing test cases
                    testCasesArray = [];
                    testCasesBody.innerHTML = '';
                    
                    // Add each imported test case
                    imported.forEach(test => {
                        const newTest = {
                            id: generateId(),
                            testString: test.testString || test.test || '',
                            expectedMatch: test.expectedMatch !== undefined ? test.expectedMatch : true
                        };
                        
                        testCasesArray.push(newTest);
                        renderTestCase(newTest);
                    });
                    
                    saveTestCases();
                    showNotification(`Imported ${imported.length} test cases`);
                } else {
                    showNotification('No valid test cases found in the file', 'error');
                }
            } catch (error) {
                showNotification(`Error importing test cases: ${error.message}`, 'error');
            }
            
            // Reset the file input
            event.target.value = '';
        };
        
        reader.readAsText(file);
    }
    
    function parseCSV(csvText) {
        const lines = csvText.split('\n');
        const result = [];
        
        // Skip header row if it exists
        const startIndex = lines[0].toLowerCase().includes('test') ? 1 : 0;
        
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = line.split(',');
            if (parts.length > 0) {
                result.push({
                    testString: parts[0].trim(),
                    expectedMatch: parts.length > 1 ? parts[1].trim().toLowerCase() === 'true' : true
                });
            }
        }
        
        return result;
    }
    
    function parseTextFile(text) {
        const lines = text.split('\n');
        return lines
            .filter(line => line.trim())
            .map(line => ({
                testString: line.trim(),
                expectedMatch: true
            }));
    }
    
    // Export functionality
    function setupExportFunctionality() {
        // Initialize the export preview
        updateExportPreview();
    }
    
    function openExportModal() {
        const pattern = regexInput.value.trim();
        if (!pattern) {
            showNotification('Please enter a regex pattern to export', 'error');
            return;
        }
        
        updateExportPreview();
        exportModal.style.display = 'block';
    }
    
    function updateExportPreview() {
        const pattern = regexInput.value.trim();
        if (!pattern) return;
        
        const flags = getSelectedFlags();
        const language = exportLanguage.value;
        const format = exportFormat.value;
        
        let code = '';
        
        if (format === 'code') {
            switch (language) {
                case 'javascript':
                    code = `const regex = /${escapeRegexForString(pattern)}/${flags};\n\n// Example usage\nconst text = "your test string here";\nconst matches = text.match(regex);\nconsole.log(matches);`;
                    break;
                case 'python':
                    code = `import re\n\npattern = r"${escapeRegexForString(pattern)}"\nregex = re.compile(pattern${flags ? ', ' + getPythonFlags(flags) : ''})\n\n# Example usage\ntext = "your test string here"\nmatches = regex.findall(text)\nprint(matches)`;
                    break;
                case 'php':
                    code = `<?php\n\n$pattern = "/${escapeRegexForString(pattern)}/${flags}";\n\n// Example usage\n$text = "your test string here";\npreg_match_all($pattern, $text, $matches);\nprint_r($matches);\n\n?>`;
                    break;
                case 'java':
                    code = `import java.util.regex.Matcher;\nimport java.util.regex.Pattern;\n\npublic class RegexExample {\n    public static void main(String[] args) {\n        String regex = "${escapeRegexForString(pattern)}";\n        Pattern pattern = Pattern.compile(regex${flags ? ', ' + getJavaFlags(flags) : ''});\n        \n        String text = "your test string here";\n        Matcher matcher = pattern.matcher(text);\n        \n        while (matcher.find()) {\n            System.out.println("Found: " + matcher.group());\n        }\n    }\n}`;
                    break;
                                case 'csharp':
                    code = `using System;\nusing System.Text.RegularExpressions;\n\nclass RegexExample\n{\n    static void Main()\n    {\n        string pattern = @"${escapeRegexForString(pattern)}";\n        RegexOptions options = ${getCSharpFlags(flags)};\n        Regex regex = new Regex(pattern, options);\n        \n        string text = "your test string here";\n        MatchCollection matches = regex.Matches(text);\n        \n        foreach (Match match in matches)\n        {\n            Console.WriteLine($"Found: {match.Value}");\n        }\n    }\n}`;
                    break;
                case 'ruby':
                    code = `# Ruby regex example\npattern = /${escapeRegexForString(pattern)}/${getRubyFlags(flags)}\n\n# Example usage\ntext = "your test string here"\nmatches = text.scan(pattern)\nputs matches`;
                    break;
            }
        } else if (format === 'markdown') {
            code = `# Regular Expression: \`/${escapeRegexForString(pattern)}/${flags}\`\n\n## Description\nThis regular expression ${generatePlainEnglishExplanation(pattern).toLowerCase()}.\n\n## Pattern Breakdown\n\`\`\`\n/${escapeRegexForString(pattern)}/${flags}\n\`\`\`\n\n${getMarkdownExplanation(pattern, flags)}\n\n## Example Matches\n\`\`\`\n${generateExamples(pattern).join('\n')}\n\`\`\``;
        } else if (format === 'json') {
            const regexData = {
                pattern: pattern,
                flags: flags,
                description: generatePlainEnglishExplanation(pattern),
                examples: generateExamples(pattern),
                components: tokenizeRegex(pattern).map(token => ({
                    type: token.type,
                    value: token.value,
                    explanation: token.explanation
                }))
            };
            
            code = JSON.stringify(regexData, null, 2);
        }
        
        // Update the preview
        exportPreviewCode.textContent = code;
        
        // Highlight the code
        hljs.highlightElement(exportPreviewCode);
    }
    
    function copyExport() {
        const code = exportPreviewCode.textContent;
        navigator.clipboard.writeText(code).then(() => {
            showNotification('Exported code copied to clipboard!');
        }).catch(err => {
            showNotification('Failed to copy code to clipboard', 'error');
        });
    }
    
    function downloadExport() {
        const code = exportPreviewCode.textContent;
        const pattern = regexInput.value.trim();
        const format = exportFormat.value;
        const language = exportLanguage.value;
        
        let filename = '';
        let mimeType = '';
        
        switch (format) {
            case 'code':
                switch (language) {
                    case 'javascript':
                        filename = 'regex-pattern.js';
                        mimeType = 'text/javascript';
                        break;
                    case 'python':
                        filename = 'regex-pattern.py';
                        mimeType = 'text/x-python';
                        break;
                    case 'php':
                        filename = 'regex-pattern.php';
                        mimeType = 'text/php';
                        break;
                    case 'java':
                        filename = 'RegexExample.java';
                        mimeType = 'text/x-java';
                        break;
                    case 'csharp':
                        filename = 'RegexExample.cs';
                        mimeType = 'text/plain';
                        break;
                    case 'ruby':
                        filename = 'regex-pattern.rb';
                        mimeType = 'text/x-ruby';
                        break;
                }
                break;
            case 'markdown':
                filename = 'regex-pattern.md';
                mimeType = 'text/markdown';
                break;
            case 'json':
                filename = 'regex-pattern.json';
                mimeType = 'application/json';
                break;
        }
        
        // Create a blob and download it
        const blob = new Blob([code], { type: mimeType });
        saveAs(blob, filename);
        
        showNotification(`Downloaded as ${filename}`);
    }
    
    function escapeRegexForString(pattern) {
        // Escape backslashes and quotes for string representation
        return pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }
    
    function getPythonFlags(flags) {
        const pythonFlags = [];
        if (flags.includes('i')) pythonFlags.push('re.IGNORECASE');
        if (flags.includes('m')) pythonFlags.push('re.MULTILINE');
        if (flags.includes('s')) pythonFlags.push('re.DOTALL');
        
        return pythonFlags.join(' | ') || 0;
    }
    
    function getJavaFlags(flags) {
        const javaFlags = [];
        if (flags.includes('i')) javaFlags.push('Pattern.CASE_INSENSITIVE');
        if (flags.includes('m')) javaFlags.push('Pattern.MULTILINE');
        if (flags.includes('s')) javaFlags.push('Pattern.DOTALL');
        
        return javaFlags.join(' | ') || 0;
    }
    
    function getCSharpFlags(flags) {
        const csharpFlags = ['RegexOptions.None'];
        if (flags.includes('i')) csharpFlags.push('RegexOptions.IgnoreCase');
        if (flags.includes('m')) csharpFlags.push('RegexOptions.Multiline');
        if (flags.includes('s')) csharpFlags.push('RegexOptions.Singleline');
        
        return csharpFlags.join(' | ');
    }
    
    function getRubyFlags(flags) {
        let rubyFlags = '';
        if (flags.includes('i')) rubyFlags += 'i';
        if (flags.includes('m')) rubyFlags += 'm';
        
        return rubyFlags;
    }
    
    function getMarkdownExplanation(pattern, flags) {
        const tokens = tokenizeRegex(pattern);
        let markdown = '';
        
        tokens.forEach(token => {
            markdown += `- \`${escapeHtml(token.value)}\`: ${token.explanation}\n`;
        });
        
        if (flags) {
            markdown += '\n### Flags\n';
            if (flags.includes('g')) markdown += '- `g` (global): Find all matches rather than stopping after the first match.\n';
            if (flags.includes('i')) markdown += '- `i` (case insensitive): Ignore case when matching.\n';
            if (flags.includes('m')) markdown += '- `m` (multiline): ^ and $ match at the beginning and end of each line.\n';
            if (flags.includes('s')) markdown += '- `s` (dotAll): . matches newline characters as well.\n';
            if (flags.includes('u')) markdown += '- `u` (unicode): Treat pattern as a sequence of Unicode code points.\n';
            if (flags.includes('y')) markdown += '- `y` (sticky): Matches only from the index indicated by lastIndex.\n';
        }
        
        return markdown;
    }
    
    // Share functionality
    function openShareModal() {
        const pattern = regexInput.value.trim();
        if (!pattern) {
            showNotification('Please enter a regex pattern to share', 'error');
            return;
        }
        
        updateShareUrl();
        generateQRCode();
        shareModal.style.display = 'block';
    }
    
    function updateShareUrl() {
        const pattern = regexInput.value.trim();
        const flags = getSelectedFlags();
        
        let url = new URL(window.location.href);
        url.search = ''; // Clear existing query params
        
        // Add regex parameters
        url.searchParams.set('pattern', pattern);
        if (flags) url.searchParams.set('flags', flags);
        
        // Add test text if the option is checked
        if (shareIncludeTest.checked && testInput.value) {
            url.searchParams.set('test', testInput.value);
        }
        
        shareUrl.value = url.toString();
    }
    
    function copyShareUrl() {
        navigator.clipboard.writeText(shareUrl.value).then(() => {
            showNotification('Share URL copied to clipboard!');
        }).catch(err => {
            showNotification('Failed to copy URL to clipboard', 'error');
        });
    }
    
    function generateQRCode() {
        // Clear previous QR code
        shareQrContainer.innerHTML = '';
        
        // Generate new QR code
        QRCode.toCanvas(shareQrContainer, shareUrl.value, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }, function(error) {
            if (error) {
                console.error('Error generating QR code:', error);
            }
        });
    }
    
    function checkForSharedRegex() {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('pattern')) {
            const pattern = urlParams.get('pattern');
            const flags = urlParams.get('flags') || '';
            const testText = urlParams.has('test') ? urlParams.get('test') : '';
            
            // Set the pattern
            regexInput.value = pattern;
            
            // Set flags
            flagCheckboxes.forEach(checkbox => {
                checkbox.checked = flags.includes(checkbox.value);
            });
            updateFlagsDisplay();
            
            // Set test text if provided
            if (testText) {
                testInput.value = testText;
            }
            
            // Process the regex
            processRegex();
            updateCoach();
            
            // Show notification
            showNotification('Loaded shared regex pattern');
        }
    }
    
    // Pattern library
    function loadPatternLibrary() {
        const patterns = [
            {
                name: 'Email',
                regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
                description: 'Matches most common email addresses.'
            },
            {
                name: 'URL',
                regex: 'https?:\\/\\/[\\w\\d\\-._~:\\/?#[\\]@!$&\'()*+,;=]+',
                description: 'Matches HTTP/HTTPS URLs.'
            },
            {
                name: 'Phone Number (US)',
                regex: '\\(\\d{3}\\)\\s?\\d{3}-\\d{4}|\\d{3}-\\d{3}-\\d{4}',
                description: 'Matches US phone numbers like (123) 456-7890 or 123-456-7890.'
            },
            {
                name: 'Date (YYYY-MM-DD)',
                regex: '\\d{4}-\\d{2}-\\d{2}',
                description: 'Matches ISO format dates like 2025-06-08.'
            },
            {
                name: 'Time (12-hour)',
                regex: '\\d{1,2}:\\d{2}\\s?[AP]M',
                description: 'Matches times like 2:30 PM.'
            },
            {
                name: 'IP Address',
                regex: '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)',
                description: 'Matches IPv4 addresses.'
            },
            {
                name: 'Strong Password',
                regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
                description: 'Matches passwords with at least 8 characters, one uppercase, one lowercase, one number and one special character.'
            },
            {
                name: 'ZIP Code (US)',
                regex: '\\d{5}(?:-\\d{4})?',
                description: 'Matches US ZIP codes like 12345 or 12345-6789.'
            },
            {
                name: 'Credit Card Number',
                regex: '(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\\d{3})\\d{11})',
                description: 'Matches major credit card numbers.'
            },
            {
                name: 'HTML Tag',
                regex: '<([a-z][a-z0-9]*)(\\s[a-z0-9\\-]+=(\\"|\\\')[^\\4]*\\4)*\\s*(\\/)?>', 
                description: 'Matches HTML tags like <div>, <img src="...">, etc.'
            },
            {
                name: 'Hex Color',
                regex: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})',
                description: 'Matches hex color values like #FF0000 or #F00.'
            },
            {
                name: 'YouTube Video ID',
                regex: '(?:youtube\\.com\\/(?:[^\\/\\n\\s]+\\/\\S+\\/|(?:v|e(?:mbed)?)\\/|\\S*?[?&]v=)|youtu\\.be\\/)([a-zA-Z0-9_-]{11})',
                description: 'Extracts the video ID from YouTube URLs.'
            }
        ];
        
        let html = '';
        patterns.forEach(pattern => {
            html += `
                <div class="pattern-card" data-regex="${escapeHtml(pattern.regex)}">
                    <h4 class="pattern-name">${escapeHtml(pattern.name)}</h4>
                    <div class="pattern-regex">/${escapeHtml(pattern.regex)}/</div>
                    <p class="pattern-description">${escapeHtml(pattern.description)}</p>
                </div>
            `;
        });
        
        patternGrid.innerHTML = html;
        
        // Add click event to load patterns
        const patternCards = document.querySelectorAll('.pattern-card');
        patternCards.forEach(card => {
            card.addEventListener('click', () => {
                const regex = card.getAttribute('data-regex');
                regexInput.value = regex;
                switchTab('explanation');
                processRegex();
                updateCoach();
            });
        });
    }
    
    // Community Patterns
    function loadCommunityPatterns() {
        // In a real implementation, this would fetch from a backend/API
        // For demo purposes, we'll simulate a fetch delay and use mock data
        
        setTimeout(() => {
            communityPatternsArray = [
                {
                    id: 'comm-1',
                    name: 'Twitter/X Username',
                    pattern: '^@?[a-zA-Z0-9_]{1,15}$',
                    description: 'Validates Twitter/X usernames, which must be 1-15 characters long and can only contain letters, numbers, and underscores. The @ symbol is optional.',
                    author: 'RegexFan',
                    tags: ['validation', 'social-media', 'web'],
                    createdAt: '2024-11-15'
                },
                {
                    id: 'comm-2',
                    name: 'Semantic Version',
                    pattern: '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$',
                    description: 'Validates semantic versioning (semver) strings like 1.0.0, 2.3.4-beta.1, etc.',
                    author: 'DevToolMaster',
                    tags: ['validation', 'code', 'versioning'],
                    createdAt: '2025-01-02'
                },
                {
                    id: 'comm-3',
                    name: 'US/Canada Postal Code',
                    pattern: '([A-Za-z]\\d[A-Za-z][ -]?\\d[A-Za-z]\\d)|(\\d{5}(?:[-\\s]\\d{4})?)',
                    description: 'Matches both US ZIP codes (12345 or 12345-6789) and Canadian postal codes (A1A 1A1 or A1A-1A1).',
                    author: 'GeoRegexer',
                    tags: ['validation', 'address', 'data-parsing'],
                    createdAt: '2025-03-12'
                },
                {
                    id: 'comm-4',
                    name: 'ISBN-13',
                    pattern: '^(?:ISBN(?:-13)?:? )?(?=[0-9]{13}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)97[89][- ]?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9]$',
                    description: 'Validates ISBN-13 numbers, with or without formatting characters and the "ISBN-13:" prefix.',
                    author: 'BookwormDev',
                    tags: ['validation', 'data-parsing', 'books'],
                    createdAt: '2025-04-18'
                },
                {
                    id: 'comm-5',
                    name: 'Extract Markdown Links',
                    pattern: '\\[([^\\[\\]]*?)\\]\\((.*?)\\)',
                    description: 'Extracts markdown links in the format [link text](url). Capturing groups: 1=link text, 2=URL.',
                    author: 'DocNinja',
                    tags: ['extraction', 'markdown', 'web'],
                    createdAt: '2025-02-08'
                },
                {
                    id: 'comm-6',
                    name: 'Extract Image Dimensions',
                    pattern: '(\\d+)\\s*x\\s*(\\d+)',
                    description: 'Extracts image dimensions in the format 123x456, with optional whitespace around the "x". Captures width and height separately.',
                    author: 'PixelParser',
                    tags: ['extraction', 'formatting', 'images'],
                    createdAt: '2025-05-22'
                }
            ];
            
            // Initialize search functionality
            initializeSearch();
            
            // Render community patterns
            renderCommunityPatterns(communityPatternsArray);
        }, 500);
    }
    
    function renderCommunityPatterns(patterns) {
        if (patterns.length === 0) {
            communityPatternsGrid.innerHTML = '<p class="empty-state">No community patterns found. Try a different search or tag.</p>';
            return;
        }
        
        let html = '';
        patterns.forEach(pattern => {
            const tagsHtml = pattern.tags.map(tag => 
                `<span class="community-pattern-tag">${escapeHtml(tag)}</span>`
            ).join('');
            
            html += `
                <div class="community-pattern-card" data-id="${pattern.id}">
                    <div class="community-pattern-header">
                        <h4 class="community-pattern-name">${escapeHtml(pattern.name)}</h4>
                        <span class="community-pattern-author">by ${escapeHtml(pattern.author)}</span>
                    </div>
                    <div class="community-pattern-regex">/${escapeHtml(pattern.pattern)}/</div>
                    <p class="community-pattern-description">${escapeHtml(pattern.description)}</p>
                    <div class="community-pattern-tags">
                        ${tagsHtml}
                    </div>
                </div>
            `;
        });
        
        communityPatternsGrid.innerHTML = html;
        
        // Add click event to load patterns
        const patternCards = communityPatternsGrid.querySelectorAll('.community-pattern-card');
        patternCards.forEach(card => {
            card.addEventListener('click', () => {
                const patternId = card.getAttribute('data-id');
                const pattern = communityPatternsArray.find(p => p.id === patternId);
                if (pattern) {
                    regexInput.value = pattern.pattern;
                    switchTab('explanation');
                    processRegex();
                    updateCoach();
                }
            });
        });
    }
    
    function initializeSearch() {
        // Initialize Fuse.js for fuzzy searching
        fuseSearch = new Fuse(communityPatternsArray, {
            keys: ['name', 'description', 'author', 'tags'],
            threshold: 0.4,
            ignoreLocation: true
        });
    }
    
    function filterCommunityPatterns() {
        const searchQuery = communitySearch.value.trim();
        const activeTag = document.querySelector('.community-patterns-tags .tag.active');
        const selectedTag = activeTag ? activeTag.getAttribute('data-tag') : 'all';
        
        let filteredPatterns = [...communityPatternsArray];
        
        // Filter by tag if not "all"
        if (selectedTag !== 'all') {
            filteredPatterns = filteredPatterns.filter(pattern => 
                pattern.tags.some(tag => tag.includes(selectedTag))
            );
        }
        
        // Apply search query if provided
        if (searchQuery) {
            const results = fuseSearch.search(searchQuery);
            filteredPatterns = results.map(result => result.item);
        }
        
        renderCommunityPatterns(filteredPatterns);
    }
    
    function openPublishModal() {
        const pattern = regexInput.value.trim();
        if (!pattern) {
            showNotification('Please enter a regex pattern to publish', 'error');
            return;
        }
        
        // Pre-fill the pattern preview
        const flags = getSelectedFlags();
        document.querySelector('.pattern-preview').textContent = `/${pattern}/${flags}`;
        
        publishModal.style.display = 'block';
    }
    
    function submitCommunityPattern() {
        const pattern = regexInput.value.trim();
        const name = publishName.value.trim();
        const description = publishDescription.value.trim();
        const tags = publishTags.value.trim().split(',').map(tag => tag.trim()).filter(Boolean);
        
        if (!name) {
            showNotification('Please enter a name for your pattern', 'error');
            return;
        }
        
        if (!description) {
            showNotification('Please enter a description for your pattern', 'error');
            return;
        }
        
        if (tags.length === 0) {
            showNotification('Please enter at least one tag', 'error');
            return;
        }
        
        // In a real app, this would send data to a server
        // For demo purposes, we'll add it locally and show a success message
        
        const newPattern = {
            id: `comm-${Date.now()}`,
            name,
            pattern,
            description,
            author: 'You', // In a real app, this would be the user's actual name
            tags,
            createdAt: new Date().toISOString().split('T')[0]
        };
        
        // Add to the beginning of the array
        communityPatternsArray.unshift(newPattern);
        
        // Update search index
        initializeSearch();
        
        // Re-render community patterns
        renderCommunityPatterns(communityPatternsArray);
        
        // Show success message
        showNotification('Pattern published to community!');
        
        // Close modal and reset form
        closeModal();
        publishName.value = '';
        publishDescription.value = '';
        publishTags.value = '';
    }
    
    // Saved patterns functionality
    function savePattern() {
        const pattern = regexInput.value.trim();
        if (!pattern) {
            showNotification('Please enter a pattern to save', 'error');
            return;
        }
        
        const flags = getSelectedFlags();
        const patternName = prompt('Enter a name for this pattern:', `Pattern ${savedPatternsArray.length + 1}`);
        
        if (patternName === null) return; // User canceled
        
        const newPattern = {
            id: generateId(),
            name: patternName || `Pattern ${savedPatternsArray.length + 1}`,
            pattern,
            flags,
            createdAt: new Date().toISOString()
        };
        
        savedPatternsArray.push(newPattern);
        
        // Save to localStorage
        localStorage.setItem('savedRegexPatterns', JSON.stringify(savedPatternsArray));
        
        // Update UI
        renderSavedPatterns();
        showNotification('Pattern saved successfully!');
    }
    
    function loadSavedPatterns() {
        const savedData = localStorage.getItem('savedRegexPatterns');
        if (savedData) {
            try {
                savedPatternsArray = JSON.parse(savedData);
                renderSavedPatterns();
            } catch (e) {
                console.error('Failed to load saved patterns:', e);
                savedPatternsArray = [];
            }
        }
    }
    
    function renderSavedPatterns() {
        if (savedPatternsArray.length === 0) {
            savedPatterns.innerHTML = '<p class="empty-state">No saved patterns yet. Save a pattern to see it here.</p>';
            return;
        }
        
        let html = '';
        savedPatternsArray.forEach(item => {
            html += `
                <div class="saved-pattern-card" data-id="${item.id}">
                    <div class="saved-pattern-actions">
                        <button class="load-pattern-btn" title="Load this pattern">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="delete-pattern-btn" title="Delete this pattern">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <h4 class="saved-pattern-name">${escapeHtml(item.name)}</h4>
                    <div class="saved-pattern-regex">/${escapeHtml(item.pattern)}/${item.flags}</div>
                </div>
            `;
        });
        
        savedPatterns.innerHTML = html;
        
        // Add event listeners to the buttons
        document.querySelectorAll('.load-pattern-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.currentTarget.closest('.saved-pattern-card');
                const patternId = card.getAttribute('data-id');
                loadSavedPattern(patternId);
                e.stopPropagation();
            });
        });
        
        document.querySelectorAll('.delete-pattern-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.currentTarget.closest('.saved-pattern-card');
                const patternId = card.getAttribute('data-id');
                deleteSavedPattern(patternId);
                e.stopPropagation();
            });
        });
    }
    
    function loadSavedPattern(id) {
        const pattern = savedPatternsArray.find(p => p.id === id);
        if (pattern) {
            regexInput.value = pattern.pattern;
            
            // Set flags
            flagCheckboxes.forEach(checkbox => {
                checkbox.checked = pattern.flags.includes(checkbox.value);
            });
            updateFlagsDisplay();
            
            processRegex();
            updateCoach();
            showNotification('Pattern loaded');
        }
    }
    
    function deleteSavedPattern(id) {
        if (confirm('Are you sure you want to delete this pattern?')) {
            savedPatternsArray = savedPatternsArray.filter(p => p.id !== id);
            localStorage.setItem('savedRegexPatterns', JSON.stringify(savedPatternsArray));
            renderSavedPatterns();
            showNotification('Pattern deleted');
        }
    }
    
    // UI Utilities
    function switchTab(tabName) {
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                btn.setAttribute('tabindex', '0');
            } else {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
                btn.setAttribute('tabindex', '-1');
            }
        });
        
        tabPanes.forEach(pane => {
            if (pane.id === `${tabName}-tab`) {
                pane.classList.add('active');
                pane.removeAttribute('hidden');
            } else {
                pane.classList.remove('active');
                pane.setAttribute('hidden', '');
            }
        });
    }
    
    function updateFlagsDisplay() {
        const flags = getSelectedFlags();
        flagsDisplay.textContent = flags;
    }
    
    function getSelectedFlags() {
        return Array.from(flagCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value)
            .join('');
    }
    
    function toggleTheme() {
        const body = document.body;
        const isDarkMode = body.classList.toggle('dark-mode');
        
        const themeIcon = themeToggleBtn.querySelector('i');
        themeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        
        // Save preference to localStorage
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
    
    function loadUserPreferences() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleBtn.querySelector('i').className = 'fas fa-sun';
        }
    }
    
    function copyRegexToClipboard() {
        const pattern = regexInput.value.trim();
        if (!pattern) {
            showNotification('No pattern to copy', 'error');
            return;
        }
        
        const flags = getSelectedFlags();
        const textToCopy = `/${pattern}/${flags}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            showNotification('Regex copied to clipboard!');
        }).catch(err => {
            showNotification('Failed to copy to clipboard', 'error');
            console.error('Failed to copy: ', err);
        });
    }
    
    function clearInputs() {
        regexInput.value = '';
        testInput.value = '';
        resetResults();
    }
    
    function resetResults() {
        currentRegex = null;
        matchCount.textContent = '0 matches found';
        matchResults.innerHTML = '<p class="empty-state">Enter a regex pattern and test text to see matches.</p>';
        regexExplanation.innerHTML = '<p class="empty-state">Enter a regex pattern to see its explanation.</p>';
        regexPlainExplanation.innerHTML = '<p class="empty-state">Enter a regex pattern to see its plain English explanation.</p>';
        updateCoach();
    }
    
    function handleRegexError(error) {
        regexInput.classList.add('error');
        matchCount.textContent = '0 matches found';
        matchResults.innerHTML = `<p class="error">Invalid regular expression: ${error.message}</p>`;
        regexExplanation.innerHTML = `<p class="error">Invalid regular expression: ${error.message}</p>`;
        regexPlainExplanation.innerHTML = `<p class="error">Invalid regular expression: ${error.message}</p>`;
    }
    
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    function closeModal(e) {
        // Close all modals
        exportModal.style.display = 'none';
        shareModal.style.display = 'none';
        publishModal.style.display = 'none';
    }
    
    function initializeHighlightJS() {
        // No-op initialization; we highlight only the export preview on demand
        try {
            if (window.hljs && typeof hljs.configure === 'function') {
                hljs.configure({ ignoreUnescapedHTML: true });
            }
        } catch (_) { /* ignore */ }
    }
    
    // Utility functions
    function escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    // Debounce utility
    function debounce(fn, wait) {
        let t;
        return function(...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }
});
