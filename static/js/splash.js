// Show the loading splash
function showLoadingSplash() {
    document.getElementById('loading-splash').style.visibility = 'visible';
}

// Hide the loading splash when done (for example, after the training process ends)
function hideLoadingSplash() {
    document.getElementById('loading-splash').style.visibility = 'hidden';
}

// Example: Show splash when the network starts training
showLoadingSplash();

setTimeout(hideLoadingSplash, 2000); // Hide after 2 seconds for demo purposes