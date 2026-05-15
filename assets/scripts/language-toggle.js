// Default languages always available
var defaultLanguages = [
    { localeKey: 'en-US', name: 'English', id: "englishLocale" },
    { localeKey: 'es-MX', name: 'Español', id: "spanishLocale" }
];

// Custom locales configuration (embedded to avoid fetch/path issues)
var customLocalesConfig = {
    sites: [
        {
            siteId: "d3a89556-35b6-4c09-a6ac-d86212581dfc",
            custom_locales: [ { locale_key: "en-PARK", locale_name: "Parker English" } ]
        },
        {
            siteId: "70436271-1338-4b36-b07f-8d1c9f3d6d33",
            custom_locales: [ { locale_key: "en-PARK", locale_name: "Parker English" } ]
        }
    ]
};

var availableLanguages = [...defaultLanguages];
var languageDropdownOpen = false;

// Toggle language dropdown open/close
function toggleLanguageDropdown(event) {
    if (event) {
        event.stopPropagation();
    }
    var panel = document.getElementById('language-dropdown-panel');
    var arrow = document.getElementById('language-dropdown-arrow');
    
    if (!panel) return;
    
    languageDropdownOpen = !languageDropdownOpen;
    
    if (languageDropdownOpen) {
        panel.classList.remove('hidden');
        if (arrow) arrow.classList.add('rotate-180');
    } else {
        panel.classList.add('hidden');
        if (arrow) arrow.classList.remove('rotate-180');
    }
}

// Close dropdown when clicking outside
function closeLanguageDropdown(event) {
    var container = document.getElementById('language-dropdown-container');
    if (container && !container.contains(event.target) && languageDropdownOpen) {
        languageDropdownOpen = false;
        var panel = document.getElementById('language-dropdown-panel');
        var arrow = document.getElementById('language-dropdown-arrow');
        if (panel) panel.classList.add('hidden');
        if (arrow) arrow.classList.remove('rotate-180');
    }
}

// Initialize click handlers for language dropdown
function initLanguageDropdown() {
    var btn = document.getElementById('language-dropdown-btn');
    if (btn) {
        btn.addEventListener('click', toggleLanguageDropdown);
    }
    document.addEventListener('click', closeLanguageDropdown);
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageDropdown);
} else {
    initLanguageDropdown();
}

function updateLanguageUI(name) {
    // Update desktop display
    var currentLang = document.getElementById('current-lang');
    if (currentLang) {
        currentLang.textContent = name;
    }

    // Update mobile select
    var mobileSelect = document.getElementById('mobile-language-select');
    if (mobileSelect) {
        var storedLocale = localStorage.getItem('glia_locale');
        if (storedLocale) {
            mobileSelect.value = storedLocale;
        }
    }
}

function toggleLanguage(localeKey, name) {
    sm.getApi({ version: 'v1' }).then(function (api) {
        api.setLocale(localeKey);
        updateLanguageUI(name);
        localStorage.setItem('glia_locale', localeKey);
        localStorage.setItem('glia_locale_name', name);
        
        // Close the dropdown after selection
        languageDropdownOpen = false;
        var panel = document.getElementById('language-dropdown-panel');
        var arrow = document.getElementById('language-dropdown-arrow');
        if (panel) panel.classList.add('hidden');
        if (arrow) arrow.classList.remove('rotate-180');
    });
}

function buildLanguageDropdowns() {
    var storedLocale = localStorage.getItem('glia_locale') || 'en-US';
    
    // Build desktop dropdown
    var desktopMenu = document.getElementById('language-dropdown-menu');
    if (desktopMenu) {
        desktopMenu.innerHTML = '';
        availableLanguages.forEach(function(lang) {
            var link = document.createElement('a');
            link.id = lang.id;
            link.href = '#';
            link.className = 'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100';
            link.setAttribute('role', 'menuitem');
            link.textContent = lang.name;
            link.onclick = function(e) {
                e.preventDefault();
                toggleLanguage(lang.localeKey, lang.name);
            };
            desktopMenu.appendChild(link);
        });
    }

    // Build mobile menu (list of clickable items)
    var mobileMenu = document.getElementById('mobile-language-menu');
    if (mobileMenu) {
        mobileMenu.innerHTML = '';
        availableLanguages.forEach(function(lang) {
            var link = document.createElement('a');
            link.href = '#';
            var isActive = lang.localeKey === storedLocale;
            link.className = 'block py-2 text-base ' + (isActive ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-600');
            link.textContent = lang.name;
            if (isActive) {
                link.innerHTML = lang.name + ' <span class="text-blue-600">✓</span>';
            }
            link.onclick = function(e) {
                e.preventDefault();
                toggleLanguage(lang.localeKey, lang.name);
                // Update active state
                buildLanguageDropdowns();
            };
            mobileMenu.appendChild(link);
        });
    }
    
    // Also support legacy mobile select if it exists
    var mobileSelect = document.getElementById('mobile-language-select');
    if (mobileSelect) {
        mobileSelect.innerHTML = '';
        availableLanguages.forEach(function(lang) {
            var option = document.createElement('option');
            option.value = lang.localeKey;
            option.textContent = lang.name;
            mobileSelect.appendChild(option);
        });
    }
}

function fetchCustomLocales(api) {
    var siteId = api.getSiteId();
    
    // Find matching site config or use default
    var siteConfig = customLocalesConfig.sites.find(function(site) {
        return site.siteId === siteId;
    });
    
    // Fall back to default if no match
    if (!siteConfig) {
        siteConfig = customLocalesConfig.sites.find(function(site) {
            return site.siteId === 'default';
        });
    }
    
    // If we found a config, use its locales
    if (siteConfig && siteConfig.custom_locales) {
        var customLocales = siteConfig.custom_locales.map(function(locale) {
            return {
                localeKey: locale.locale_key,
                name: locale.locale_name,
                id: locale.locale_name.toLowerCase().replace(/\s/g, '') + 'Locale'
            };
        });
        
        // Filter out en-US and es-MX from custom locales (we'll add defaults first)
        var additionalLocales = customLocales.filter(function(locale) {
            return locale.localeKey !== 'en-US' && locale.localeKey !== 'es-MX';
        });
        
        // Always start with English and Spanish, then add any additional locales
        availableLanguages = [...defaultLanguages, ...additionalLocales];
    }
    
    // Build dropdowns with the loaded languages
    buildLanguageDropdowns();
    restoreStoredLocale(api);
}

function restoreStoredLocale(api) {
    var storedLocale = localStorage.getItem('glia_locale');
    var storedName = localStorage.getItem('glia_locale_name');
    
    if (storedLocale && storedName) {
        api.setLocale(storedLocale);
        updateLanguageUI(storedName);
    } else {
        updateLanguageUI('English');
    }
}

// Apply stored locale when Glia is ready
window.addEventListener('glia-installed', function () {
    sm.getApi({ version: 'v1' }).then(function (api) {
        fetchCustomLocales(api);
    });
});
