/**
 * Shared form validation utilities
 * Include this script in the site header to enable validation on all forms
 */

// Find the error message element for a field
function findErrorMessage(field) {
    // Try direct sibling first
    let errorMsg = field.parentElement.querySelector('.error-message');
    
    // Try closest div's error message
    if (!errorMsg) {
        const closestDiv = field.closest('div');
        if (closestDiv) {
            errorMsg = closestDiv.querySelector('.error-message');
        }
    }
    
    // For checkboxes, try the parent's next sibling or parent's parent
    if (!errorMsg && field.type === 'checkbox') {
        const flexContainer = field.closest('.flex');
        if (flexContainer && flexContainer.nextElementSibling) {
            errorMsg = flexContainer.nextElementSibling.classList.contains('error-message') 
                ? flexContainer.nextElementSibling 
                : null;
        }
    }
    
    return errorMsg;
}

// Validate a form and show/hide error messages
function validate(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[data-required="true"]');
    
    requiredFields.forEach(field => {
        const errorMsg = findErrorMessage(field);
        const value = field.type === 'checkbox' ? field.checked : field.value.trim();
        
        if (!value) {
            isValid = false;
            if (errorMsg) errorMsg.classList.remove('hidden');
        } else {
            if (errorMsg) errorMsg.classList.add('hidden');
        }
    });
    
    return isValid;
}

// Clear error message when user enters data
function clearErrorOnInput(field) {
    const errorMsg = findErrorMessage(field);
    if (errorMsg) {
        const value = field.type === 'checkbox' ? field.checked : field.value.trim();
        if (value) {
            errorMsg.classList.add('hidden');
        }
    }
}

// Initialize validation listeners on all forms with data-required fields
function initFormValidation() {
    const requiredFields = document.querySelectorAll('[data-required="true"]');
    requiredFields.forEach(field => {
        // Listen for input/change events to clear errors
        field.addEventListener('input', function() {
            clearErrorOnInput(this);
        });
        field.addEventListener('change', function() {
            clearErrorOnInput(this);
        });
    });
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initFormValidation);
