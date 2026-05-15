/**
 * Shared form validation utilities
 * Include this script in the site header to enable validation on all forms
 * 
 * Error messages are dynamically created and appended to the DOM when validation fails.
 * No need to pre-define hidden error-msg elements in HTML.
 */

// Store references to dynamically created error messages
const errorMessageMap = new WeakMap();

// Get or create error message element for a field
function getOrCreateErrorMessage(field) {
    // Check if we already created an error message for this field
    if (errorMessageMap.has(field)) {
        return errorMessageMap.get(field);
    }
    
    // Find the appropriate container for the error message
    let container = field.parentElement;
    
    // For checkboxes in flex containers, go up one more level
    if (field.type === 'checkbox') {
        const flexContainer = field.closest('.flex');
        if (flexContainer && flexContainer.parentElement) {
            container = flexContainer.parentElement;
        }
    }
    
    // Traverse up to find a container with a label (better placement)
    let labelContainer = field.parentElement;
    for (let i = 0; i < 3 && labelContainer; i++) {
        if (labelContainer.querySelector('label')) {
            container = labelContainer;
            break;
        }
        labelContainer = labelContainer.parentElement;
    }
    
    if (!container) return null;
    
    // Create new error message element
    const errorMsg = document.createElement('p');
    errorMsg.className = 'error-msg text-red-600 text-sm mb-1';
    errorMsg.textContent = field.dataset.errorMessage || 'This field is required';
    errorMsg.style.display = 'none';
    
    // Find the best insertion point
    const label = container.querySelector('label');
    if (label && label.parentElement === container) {
        // Insert after the label
        label.insertAdjacentElement('afterend', errorMsg);
    } else if (field.parentElement === container) {
        // Insert before the field
        container.insertBefore(errorMsg, field);
    } else {
        // Insert at the beginning of the container
        container.insertBefore(errorMsg, container.firstChild);
    }
    
    // Store reference for future use
    errorMessageMap.set(field, errorMsg);
    
    return errorMsg;
}

// Show error message for a field
function showError(field, message) {
    const errorMsg = getOrCreateErrorMessage(field);
    if (errorMsg) {
        errorMsg.textContent = message || field.dataset.errorMessage || 'This field is required';
        errorMsg.style.display = 'block';
    }
    field.classList.add('border-red-500');
}

// Hide error message for a field
function hideError(field) {
    const errorMsg = errorMessageMap.get(field);
    if (errorMsg) {
        errorMsg.style.display = 'none';
    }
    field.classList.remove('border-red-500');
}

// Remove error message element from DOM
function removeError(field) {
    const errorMsg = errorMessageMap.get(field);
    if (errorMsg && errorMsg.parentElement) {
        errorMsg.parentElement.removeChild(errorMsg);
        errorMessageMap.delete(field);
    }
    field.classList.remove('border-red-500');
}

// Validate a form and show/hide error messages
function validate(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[data-required="true"]');
    
    requiredFields.forEach(field => {
        const value = field.type === 'checkbox' ? field.checked : field.value.trim();
        
        if (!value) {
            isValid = false;
            showError(field);
        } else {
            hideError(field);
        }
    });
    
    return isValid;
}

// Clear error message when user enters data
function clearErrorOnInput(field) {
    const value = field.type === 'checkbox' ? field.checked : field.value.trim();
    if (value) {
        hideError(field);
    }
}

// Initialize validation listeners on all forms
function initFormValidation() {
    // Add listeners to all required fields
    const requiredFields = document.querySelectorAll('[data-required="true"]');
    requiredFields.forEach(field => {
        field.addEventListener('input', function() {
            clearErrorOnInput(this);
        });
        field.addEventListener('change', function() {
            clearErrorOnInput(this);
        });
    });
    
    // Add validation to all forms that don't have custom handlers
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (!form.dataset.validationInitialized) {
            form.dataset.validationInitialized = 'true';
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                validate(this);
            });
        }
    });
}

// Legacy support: find existing error-msg elements (for backwards compatibility)
function findErrorMessage(field) {
    // First check our map
    if (errorMessageMap.has(field)) {
        return errorMessageMap.get(field);
    }
    
    // Look for existing .error-msg in parent containers
    let container = field.parentElement;
    for (let i = 0; i < 3 && container; i++) {
        let errorMsg = container.querySelector('.error-msg');
        if (errorMsg) {
            errorMessageMap.set(field, errorMsg);
            return errorMsg;
        }
        container = container.parentElement;
    }
    
    return null;
}

// Legacy support: create error message (calls new function)
function createErrorMessage(field) {
    return getOrCreateErrorMessage(field);
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initFormValidation);
