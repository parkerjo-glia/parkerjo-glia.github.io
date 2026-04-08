// Default languages always available
var defaultLanguages = [
    { localeKey: 'en-US', name: 'English' },
    { localeKey: 'es-MX', name: 'Español' }
];

var availableLanguages = [...defaultLanguages];

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
            link.id = lang.name.toLowerCase().replace(/\s/g, '') + 'Locale';
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
    
    fetch('/assets/json/custom_locales.json')
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to load custom_locales.json');
            }
            return response.json();
        })
        .then(function(data) {
            // Find matching site config or use default
            var siteConfig = data.sites.find(function(site) {
                return site.siteId === siteId;
            });
            
            // Fall back to default if no match
            if (!siteConfig) {
                siteConfig = data.sites.find(function(site) {
                    return site.siteId === 'default';
                });
            }
            
            // If we found a config, use its locales
            if (siteConfig && siteConfig.custom_locales) {
                var customLocales = siteConfig.custom_locales.map(function(locale) {
                    return {
                        localeKey: locale.locale_key,
                        name: locale.locale_name
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
        })
        .catch(function(error) {
            console.warn('Could not load custom locales, using defaults:', error);
            // Use default languages on error
            availableLanguages = [...defaultLanguages];
            buildLanguageDropdowns();
            restoreStoredLocale(api);
        });
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
