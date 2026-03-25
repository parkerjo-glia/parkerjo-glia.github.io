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
    // Build desktop dropdown
    var desktopMenu = document.getElementById('language-dropdown-menu');
    if (desktopMenu) {
        desktopMenu.innerHTML = '';
        availableLanguages.forEach(function(lang) {
            var link = document.createElement('a');
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

    // Build mobile select
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
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.glia.com/visitor_app/sites/' + siteId + '/custom_locales');

    var requestHeaders = api.getRequestHeaders();
    Object.keys(requestHeaders).forEach(function (key) {
        xhr.setRequestHeader(key, requestHeaders[key]);
    });

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                var response = JSON.parse(xhr.responseText);
                // Add custom locales to available languages
                if (Array.isArray(response.custom_locales)) {
                    response.custom_locales.forEach(function(locale) {
                        // Check if locale_key already exists
                        var exists = availableLanguages.some(function(lang) {
                            return lang.localeKey === locale.locale_key;
                        });
                        if (!exists && locale.locale_key && locale.name) {
                            availableLanguages.push({
                                localeKey: locale.locale_key,
                                name: locale.name
                            });
                        }
                    });
                }
            } catch (e) {
                console.log('Error parsing custom locales:', e);
            }
        }
        // Build dropdowns after fetching (even if fetch failed, use defaults)
        buildLanguageDropdowns();
        restoreStoredLocale(api);
    };

    xhr.onerror = function () {
        console.log('Error fetching custom locales');
        buildLanguageDropdowns();
        restoreStoredLocale(api);
    };

    xhr.send();
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
