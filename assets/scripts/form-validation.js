/**
 * Shared form validation utilities
 * Include this script in the site header to enable validation on all forms
 */

// Find the error message element for a field (looks for .error-msg in parent containers)
function findErrorMessage(field) {
    // Start with the immediate parent and traverse up to find .error-msg
    let container = field.parentElement;
    
    // Traverse up to 3 levels to find the error message
    for (let i = 0; i < 3 && container; i++) {
        let errorMsg = container.querySelector('.error-msg');
        if (errorMsg) return errorMsg;
        container = container.parentElement;
    }
    
    // For checkboxes in flex containers
    if (field.type === 'checkbox') {
        const flexContainer = field.closest('.flex');
        if (flexContainer) {
            const parent = flexContainer.parentElement;
            if (parent) {
                return parent.querySelector('.error-msg');
            }
        }
    }
    
    return null;
}

// Create error message element if it doesn't exist
function createErrorMessage(field) {
    // First check if error message already exists using findErrorMessage
    let existingError = findErrorMessage(field);
    if (existingError) return existingError;
    
    // Find the container that has the label (traverse up if needed)
    let container = field.parentElement;
    for (let i = 0; i < 3 && container; i++) {
        if (container.querySelector('label')) break;
        container = container.parentElement;
    }
    
    if (!container) return null;
    
    // Create new error message element
    const errorMsg = document.createElement('p');
    errorMsg.className = 'error-msg text-red-600 text-sm mb-1 hidden';
    errorMsg.textContent = 'This field is required';
    
    // Find the label and insert after it
    const label = container.querySelector('label');
    if (label) {
        label.insertAdjacentElement('afterend', errorMsg);
    } else {
        // Insert before the field
        field.parentElement.insertBefore(errorMsg, field);
    }
    
    return errorMsg;
}

// Validate a form and show/hide error messages
function validate(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[data-required="true"]');
    
    requiredFields.forEach(field => {
        let errorMsg = findErrorMessage(field);
        if (!errorMsg) {
            errorMsg = createErrorMessage(field);
        }
        
        const value = field.type === 'checkbox' ? field.checked : field.value.trim();
        
        if (!value) {
            isValid = false;
            if (errorMsg) errorMsg.classList.remove('hidden');
            field.classList.add('border-red-500');
        } else {
            if (errorMsg) errorMsg.classList.add('hidden');
            field.classList.remove('border-red-500');
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
            field.classList.remove('border-red-500');
        }
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

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initFormValidation);
