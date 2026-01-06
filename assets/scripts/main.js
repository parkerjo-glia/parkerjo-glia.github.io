document.addEventListener('click', (event) => {
    const target = event.target;
    // Find the closest parent with a data-page attribute
    const button = target.closest('[data-page]');
    if (button) {
        event.preventDefault();
        navigate(button.dataset.page);
    }
    // Check for logout button
    if (target.matches('[data-action="logout"]')) {
        event.preventDefault();
        handleLogout();
    }
});

function navigate(page) {
    // Prevent navigation to profile if not logged in
    if (page === 'profile' && !state.isLoggedIn) {
        state.currentPage = 'login';
    } else {
        // Add .html extension if not present
        const url = page.includes('.html') ? page : page + '.html';
        location.href = url;
    }
}

function showMessage(message, isError = true) {
    const messageBox = document.getElementById('message-box');
    messageBox.textContent = message;
    messageBox.style.backgroundColor = isError ? '#ef4444' : '#22c55e';
    messageBox.classList.add('show');
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, 3000);
}