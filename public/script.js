let currentLanguage = 'en'; // Default language is English

// Function to load the language JSON based on current language
const loadLanguage = async () => {
  try {
    // Fetch the appropriate JSON file for the selected language
    const response = await fetch(`/public/${currentLanguage}.json`);
    const languageData = await response.json();
    
    // Update HTML with the translations
    document.getElementById('title').textContent = languageData.title;
    document.getElementById('searchJobs').textContent = languageData.searchJobs;
    document.getElementById('uploadJob').textContent = languageData.uploadJob;
    document.getElementById('availableJobs').textContent = languageData.availableJobs;
    document.getElementById('logout').textContent = languageData.logout;
  } catch (error) {
    console.error("Error loading language file:", error);
  }
};

// Function to change language
const changeLanguage = (lang) => {
  currentLanguage = lang; // Update the current language
  loadLanguage();  // Load the new language when the user selects it
};

// Call loadLanguage when the page is loaded
window.onload = loadLanguage;
