let input = document.getElementById("inputbox");
let scientificInput = document.getElementById("scientific-inputbox");
let string = "";
let scientificString = "";

// Calculator mode switching
let currentMode = 'standard';

// Only select calculator buttons (excluding UI buttons)
const calculatorButtons = document.querySelectorAll('.calculator button:not(.menu-btn):not(.history-btn):not(.close-drawer):not(.close-history-drawer):not(.clear-history-btn):not(.tab):not(.converter-inputs button)');

// UI Elements
const menuBtn = document.querySelector('.menu-btn');
const historyBtn = document.querySelector('.history-btn');
const sideDrawer = document.querySelector('.side-drawer');
const closeDrawer = document.querySelector('.close-drawer');
const bottomHistoryDrawer = document.querySelector('.bottom-history-drawer');
const closeHistoryDrawer = document.querySelector('.close-history-drawer');
const clearHistoryBtn = document.querySelector('.clear-history-btn');
const historyList = document.getElementById('historyList');
const tabs = document.querySelectorAll('.tab');
const tabPanels = document.querySelectorAll('.tab-panel');
const themeRadios = document.querySelectorAll('input[name="theme"]');
// Removed converter-related variables as they're no longer needed
const userStatus = document.getElementById('user-status');
const userDetails = document.getElementById('user-details');

// User state
let isSignedIn = false;
let user = {
    name: "John Doe",
    email: "john.doe@example.com"
};

// History tracking
let calculationHistory = [];
let currentCalculation = "";

// Calculator functionality
calculatorButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        const currentInput = currentMode === 'standard' ? input : scientificInput;
        const currentString = currentMode === 'standard' ? string : scientificString;
        
        if(e.target.innerHTML == "="){
            try {
                currentCalculation = currentString;
                let result = evaluateExpression(currentString);
                if (currentMode === 'standard') {
                    string = result;
                    input.value = string;
                } else {
                    scientificString = result;
                    scientificInput.value = scientificString;
                }
                // Save to history
                saveToHistory(currentCalculation, result);
            } catch (error) {
                if (currentMode === 'standard') {
                    string = "Error";
                    input.value = string;
                } else {
                    scientificString = "Error";
                    scientificInput.value = scientificString;
                }
            }
        }
        else if(e.target.innerHTML =="AC"){
            if (currentMode === 'standard') {
                string="";
                input.value = string;
            } else {
                scientificString="";
                scientificInput.value = scientificString;
            }
        }
        else if(e.target.innerHTML =="Del"){
            if (currentMode === 'standard') {
                string = string.slice(0,-1);
                input.value = string;
            } else {
                scientificString = scientificString.slice(0,-1);
                scientificInput.value = scientificString;
            }
        }
        else{
            if (currentMode === 'standard') {
                string += e.target.innerHTML;
                input.value = string;
            } else {
                scientificString += e.target.innerHTML;
                scientificInput.value = scientificString;
            }
        }
    });
});

// Menu button click handler
menuBtn.addEventListener('click', () => {
    sideDrawer.classList.add('active');
});

// Close drawer button click handler
closeDrawer.addEventListener('click', () => {
    sideDrawer.classList.remove('active');
});

// History button click handler
historyBtn.addEventListener('click', () => {
    bottomHistoryDrawer.classList.add('active');
    updateHistoryDisplay();
});

// Close history drawer button click handler
closeHistoryDrawer.addEventListener('click', () => {
    bottomHistoryDrawer.classList.remove('active');
});

// Clear history button click handler
clearHistoryBtn.addEventListener('click', () => {
    clearHistory();
});



// Tab switching functionality
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Hide all tab panels
        tabPanels.forEach(panel => panel.classList.remove('active'));
        // Show the corresponding tab panel
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        // Handle calculator mode switching
        if (tabId === 'standard') {
            switchToStandardMode();
        } else if (tabId === 'scientific') {
            switchToScientificMode();
        }
        
        // Close the drawer after selection
        sideDrawer.classList.remove('active');
    });
});

// Calculator mode switching functions (for direct access)
function switchToStandardMode() {
    currentMode = 'standard';
    document.getElementById('standard-calculator').classList.add('active');
    document.getElementById('scientific-calculator').classList.remove('active');
}

function switchToScientificMode() {
    currentMode = 'scientific';
    document.getElementById('standard-calculator').classList.remove('active');
    document.getElementById('scientific-calculator').classList.add('active');
}

// Scientific calculator functions
function evaluateExpression(expression) {
    // Replace scientific functions with JavaScript equivalents
    expression = expression.replace(/sin\(/g, 'Math.sin(');
    expression = expression.replace(/cos\(/g, 'Math.cos(');
    expression = expression.replace(/tan\(/g, 'Math.tan(');
    expression = expression.replace(/log\(/g, 'Math.log10(');
    expression = expression.replace(/ln\(/g, 'Math.log(');
    expression = expression.replace(/√\(/g, 'Math.sqrt(');
    expression = expression.replace(/π/g, 'Math.PI');
    expression = expression.replace(/e/g, 'Math.E');
    expression = expression.replace(/x²/g, '**2');
    expression = expression.replace(/x³/g, '**3');
    expression = expression.replace(/x\^y/g, '**');
    expression = expression.replace(/1\/x/g, '1/');
    expression = expression.replace(/\|x\|/g, 'Math.abs(');
    
    // Handle parentheses for absolute value
    expression = expression.replace(/Math\.abs\(([^)]+)\)/g, 'Math.abs($1)');
    
    return eval(expression);
}

// Theme switching functionality
themeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        document.body.className = ''; // Remove all theme classes
        if (e.target.value !== 'dark') {
            document.body.classList.add(`${e.target.value}-theme`);
        }
    });
});

// Initialize the calculator
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
});

// Save calculation to history
function saveToHistory(calculation, result) {
    const historyItem = {
        id: Date.now(),
        calculation: calculation,
        result: result,
        timestamp: new Date()
    };
    
    calculationHistory.unshift(historyItem); // Add to beginning of array
    
    // Keep only last 50 calculations
    if (calculationHistory.length > 50) {
        calculationHistory = calculationHistory.slice(0, 50);
    }
    
    // Save to localStorage
    localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
}

// Update history display
function updateHistoryDisplay() {
    if (calculationHistory.length === 0) {
        historyList.innerHTML = '<div class="no-history">No calculations yet</div>';
        return;
    }
    
    historyList.innerHTML = calculationHistory.map(item => `
        <div class="history-item" data-calculation="${item.calculation}" data-result="${item.result}">
            <div class="history-calculation">${item.calculation}</div>
            <div class="history-result">= ${item.result}</div>
            <div class="history-timestamp">${formatTimestamp(item.timestamp)}</div>
        </div>
    `).join('');
    
    // Add click listeners to history items
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const calculation = item.dataset.calculation;
            const result = item.dataset.result;
            string = result;
            input.value = result;
            bottomHistoryDrawer.classList.remove('active');
        });
    });
}

// Clear all history
function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        calculationHistory = [];
        localStorage.removeItem('calculatorHistory');
        updateHistoryDisplay();
    }
}

// Format timestamp for display
function formatTimestamp(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    
    if (diff < 60000) { // Less than 1 minute
        return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < 86400000) { // Less than 1 day
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        return timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString();
    }
}

// Load history from localStorage on page load
function loadHistory() {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
        calculationHistory = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects
        calculationHistory = calculationHistory.map(item => ({
            ...item,
            timestamp: new Date(item.timestamp)
        }));
    }
}