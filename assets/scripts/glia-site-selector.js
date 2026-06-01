// Safety checks - ensure globals exist (should be defined by glia-installer.js)
window.gliaDemo = window.gliaDemo || {};
window.gliaDemo.sites = window.gliaDemo.sites || [];
window.gliaDemo.seAgents = window.gliaDemo.seAgents || [];
window.gliaContextSessionItemKey = window.gliaContextSessionItemKey || "gliaContextSession";

function initSiteSelector() {
    // Modal is already in the DOM via Jekyll include, just set up event handlers
    $('#siteSelectorModal').on('shown.bs.modal', function () {
        prepSettingsForm();
    });

    $('#siteSelectorDDL').on('change', function () {
        $('#siteIdTXT').val($('#siteSelectorDDL').val());
        validateSiteId();
        updateSeAgentDropdown($('#siteSelectorDDL').val());
    });

    $('#siteIdTXT').on('input', function () {
        const textValue = $(this).val().trim();
        if (textValue !== '') {
            const selectedOption = $('#siteSelectorDDL').find(`option[value="${textValue}"]`);
            $('#siteSelectorDDL').val(selectedOption.val());
            updateSeAgentDropdown(textValue);
        } else {
            $('#siteSelectorDDL').val($('#siteSelectorDDL option:first').val());
            updateSeAgentDropdown('');
        }
    });

    $('#siteIdTXT').on('blur', function() {
        validateSiteId();
    });

    $('#saveSettings').on('click', function () {
        const siteIdFieldError = $("#siteid-error");
        siteIdFieldError.hide();
        const siteId = $('#siteIdTXT').val();

        if (validateSiteId()) {
            const selectedOption = $('#siteSelectorDDL').find(`option[value="${siteId}"]`);

            const selectedSite = {
                id: siteId,
                name: selectedOption.text() !== '' ? selectedOption.text().trim() : siteId
            }

            // Check if user is currently logged in before clearing
            const wasLoggedIn = localStorage.getItem('loggingStatus') === 'true';

            // Clear all localStorage items except the new site selection
            localStorage.removeItem(window.gliaContextSessionItemKey);
            localStorage.removeItem('activeEngagement');
            localStorage.removeItem('useDirectId');
            localStorage.removeItem('loggingStatus');
            localStorage.removeItem('username');
            localStorage.removeItem('sessionExpiration');
            
            // Set the new site
            localStorage.setItem('glia_site', JSON.stringify(selectedSite));
            bootstrap.Modal.getInstance(document.getElementById('siteSelectorModal')).hide();
            
            // If user was logged in, redirect to home with signout hash
            if (wasLoggedIn) {
                // Get the base path (e.g., /aifirst-bank or /aifirst-cu)
                const pathParts = window.location.pathname.split('/').filter(p => p);
                const basePath = pathParts.length > 0 ? '/' + pathParts[0] : '';
                window.location.href = basePath + '/index.html#signout';
            } else {
                // Get the selected SE agent code if any
                const selectedAgentCode = $('#seAgentDDL').val();
                window.location.href = getCleanReloadUrl(selectedAgentCode);
            }
        }
    });
    
    // Remove openSettings param when modal is closed
    $('#siteSelectorModal').on('hidden.bs.modal', function () {
        removeOpenSettingsParam();
    });
}

function validateSiteId(){
    const siteIdFieldError = $("#siteid-error");
    siteIdFieldError.hide();
    const siteId = $('#siteIdTXT').val();
    
    if (!siteId || !isUUID(siteId)) {
        siteIdFieldError.text(siteId ? "Site Id Must Be a Valid UUID" : "Site Id is required");
        siteIdFieldError.show();
        return false;
    }

    return true;
}

async function prepSettingsForm() {
    await buildSelectOptionsAsync('siteSelectorDDL');
    const gliaSiteRaw = localStorage.getItem('glia_site');
    const gliaSite = JSON.parse(gliaSiteRaw);
    const activeEngagement = localStorage.getItem('activeEngagement');
    
    // Check for active engagement and show warning / disable fields
    const existingWarning = document.getElementById('engagement-warning');
    if (existingWarning) existingWarning.remove();
    
    if (activeEngagement) {
        const warningDiv = document.createElement('div');
        warningDiv.id = 'engagement-warning';
        warningDiv.className = 'alert alert-warning mb-3';
        warningDiv.innerHTML = '<strong>Engagement Active:</strong> You cannot change the Glia site while an engagement is in progress.';
        const form = document.getElementById('settingsForm');
        if (form) form.insertBefore(warningDiv, form.firstChild);
        
        $('#siteSelectorDDL').prop('disabled', true);
        $('#siteIdTXT').prop('readonly', true);
        $('#seAgentDDL').prop('disabled', true);
        $('#saveSettings').prop('disabled', true);
    } else {
        $('#siteSelectorDDL').prop('disabled', false);
        $('#siteIdTXT').prop('readonly', false);
        $('#seAgentDDL').prop('disabled', false);
        $('#saveSettings').prop('disabled', false);
    }
    
    if (gliaSite) {
        const siteSelectorDDL = $('#siteSelectorDDL');
        const siteIdTXT = $('#siteIdTXT');
        if (siteSelectorDDL.find(`option[value="${gliaSite.id}"]`).length > 0) {
            siteSelectorDDL.val(gliaSite.id);
            siteIdTXT.val(gliaSite.id);
        } else {
            siteSelectorDDL.val(siteSelectorDDL.find('option:first').val());
            siteIdTXT.val(gliaSite.id);
        }
        // Update SE agent dropdown based on current site
        updateSeAgentDropdown(gliaSite.id);
    } else {
        // Hide SE agent dropdown if no site selected
        updateSeAgentDropdown('');
    }
}

async function buildSelectOptionsAsync(selectId) {
    return new Promise((resolve) => {
        const $select = $('#' + selectId);
        $select.empty();
        window.gliaDemo.sites.forEach(opt => {
            $select.append($('<option>', {
                value: opt.id,
                text: opt.name
            }));
        });
        resolve();
    });
}

function getQueryParam(paramName) {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);

    for (const [key, value] of params.entries()) {
        if (key === paramName) {
            return value;
        }
    }

    return null;
}

function removeOpenSettingsParam() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('openSettings')) {
        url.searchParams.delete('openSettings');
        window.history.replaceState({}, document.title, url.pathname + url.search);
    }
}

function getCleanReloadUrl(agentCode) {
    const url = new URL(window.location.href);
    url.searchParams.delete('openSettings');
    
    // Build the final URL with agent code as first param if provided
    if (agentCode) {
        // Get remaining params after removing openSettings
        const remainingParams = url.searchParams.toString();
        // Build URL with agent code first (just the code, no key)
        let finalUrl = url.pathname + '?' + encodeURIComponent(agentCode);
        if (remainingParams) {
            finalUrl += '&' + remainingParams;
        }
        return finalUrl;
    }
    
    return url.pathname + url.search;
}

function updateSeAgentDropdown(siteId) {
    const $agentGroup = $('#seAgentGroup');
    const $agentDDL = $('#seAgentDDL');
    
    // Find agents for this site
    const siteAgents = window.gliaDemo.seAgents.find(sa => sa.siteId === siteId);
    
    if (siteAgents && siteAgents.agents && siteAgents.agents.length > 0) {
        // Clear and populate dropdown
        $agentDDL.empty();
        // Add blank option first
        $agentDDL.append($('<option>', { value: '', text: '' }));
        // Add agents
        siteAgents.agents.forEach(agent => {
            $agentDDL.append($('<option>', {
                value: agent.code,
                text: agent.name
            }));
        });
        $agentGroup.show();
    } else {
        $agentDDL.empty();
        $agentGroup.hide();
    }
}

// Opens the site selector modal directly without redirecting
// Called from header and footer "change Glia site" links
function openSiteSelectorModal(event) {
    if (event) {
        event.preventDefault();
    }
    
    // Check for active engagement first
    const activeEngagement = localStorage.getItem('activeEngagement');
    if (activeEngagement) {
        alert('Cannot change Glia site while an engagement is active.');
        return;
    }
    
    // Open the modal on the current page
    const modalEl = document.getElementById('siteSelectorModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } else {
        console.error('Site selector modal not found');
    }
}

function init() {
    const siteParam = getQueryParam("glia_site");
    const openSettings = getQueryParam("openSettings");

    if (siteParam) {
        let selectedSite = window.gliaDemo.sites.find(
            site => site.id === siteParam || site.code === siteParam
        );

        if (!selectedSite && isUUID(siteParam)) {
            selectedSite = { id: siteParam, name: "Manual Demo" };
        }

        if (selectedSite) {
            localStorage.setItem('glia_site', JSON.stringify(selectedSite));
        }
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Initialize site selector event handlers (modal is already in DOM via Jekyll include)
        initSiteSelector();
        const settingsLink = document.getElementById('settings-link');
        if (settingsLink) {
            settingsLink.addEventListener('click', function() {
                const modal = new bootstrap.Modal(document.getElementById('siteSelectorModal'));
                modal.show();
            });
        }
        
        const gliaSiteRaw = localStorage.getItem('glia_site');
        const gliaSiteElement = document.getElementById('glia-site');
        if (gliaSiteElement) {
            const gliaSite = JSON.parse(gliaSiteRaw);
            if (gliaSite) {
                gliaSiteElement.textContent = gliaSite.name;
            }
        }
        
        // Display current Glia site in footer and handle engagement lock
        const currentGliaSiteDisplay = document.getElementById('current-glia-site-display');
        const changeGliaSiteLink = document.getElementById('change-glia-site-link');
        const headerGliaSiteDisplay = document.getElementById('header-glia-site-display');
        
        // Helper function to set site display text
        function setSiteDisplayText(element, gliaSite, short) {
            if (gliaSite && gliaSite.name && gliaSite.name !== gliaSite.id) {
                // Show full name with ... to indicate hover for more info
                element.textContent = gliaSite.name + ' ...';
                element.title = gliaSite.name + '\n' + gliaSite.id;
            } else if (gliaSite && gliaSite.id) {
                // Only have ID, show truncated with ...
                element.textContent = gliaSite.id.substring(0, 8) + '...';
                element.title = gliaSite.id;
            } else {
                element.textContent = 'Not configured';
            }
        }
        
        if (currentGliaSiteDisplay) {
            if (gliaSiteRaw) {
                const gliaSite = JSON.parse(gliaSiteRaw);
                setSiteDisplayText(currentGliaSiteDisplay, gliaSite, false);
            } else {
                currentGliaSiteDisplay.textContent = 'Not configured';
            }
        }
        
        if (headerGliaSiteDisplay) {
            if (gliaSiteRaw) {
                const gliaSite = JSON.parse(gliaSiteRaw);
                setSiteDisplayText(headerGliaSiteDisplay, gliaSite, true);
            } else {
                headerGliaSiteDisplay.textContent = 'Not set';
            }
        }
        
        // Block site change link if engagement is active
        const activeEngagement = localStorage.getItem('activeEngagement');
        
        if (changeGliaSiteLink) {
            if (activeEngagement) {
                changeGliaSiteLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    alert('Cannot change Glia site while an engagement is active.');
                });
                changeGliaSiteLink.style.opacity = '0.5';
                changeGliaSiteLink.style.cursor = 'not-allowed';
            }
        }
        
        // Also handle header Glia site link
        const headerChangeGliaSiteLink = document.getElementById('header-change-glia-site-link');
        if (headerChangeGliaSiteLink) {
            if (activeEngagement) {
                headerChangeGliaSiteLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    alert('Cannot change Glia site while an engagement is active.');
                });
                headerChangeGliaSiteLink.style.opacity = '0.5';
                headerChangeGliaSiteLink.style.cursor = 'not-allowed';
            }
        }
        
        // Auto-open settings modal if openSettings param is present
        if (openSettings === 'true') {
            setTimeout(function() {
                const modalEl = document.getElementById('siteSelectorModal');
                if (modalEl) {
                    const modal = new bootstrap.Modal(modalEl);
                    modal.show();
                }
            }, 500);
        }
    });
}

// Self-initialize using global siteBasePath set by layout
init();
