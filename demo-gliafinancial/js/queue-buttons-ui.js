// The following functions define selectors for the example UI
// Replace these with selectors for your UI.

function findQueuingInstructionsElement() {
  return document.querySelector('div.instructions');
}

function findQueueElement(queueName) {
  return document.querySelector("div.queue[queue_name='" + queueName + "']");
}

function findAllQueueElements() {
  return document.querySelectorAll('div.queue');
}

function findAllQueueMediaButtons() {
  return document.querySelectorAll('div.queue > button.media_button');
}

function findMediaButtonsForQueue(queueElement) {
  return queueElement.querySelectorAll('button.media_button');
}

function findCancelButton() {
  return document.querySelector('button.cancel');
}

function getMediaButtonQueueName(button) {
  return button.parentElement.getAttribute('queue_name');
}

function getButtonMedium(button) {
  return button.getAttribute('medium');
}

// The following functions define simplistic user interface transitions.
// Replace these functions with functions that fit your user interface.

function hide(element) {
  element.style.display = 'none';
}

function show(element) {
  element.style.display = 'block';
}

function showCanQueue(queueElement, queueMedias) {
  // Queue is open, a set of medias available
  //queueElement.style['text-decoration'] = 'none';
  updateQueueAvailableMedia(queueElement, queueMedias);
}

function showCannotQueue(queueElement) {
  // Queue is closed
  //queueElement.style['text-decoration'] = 'line-through';
  updateQueueAvailableMedia(queueElement, []); // Disables all media buttons
}

function showCannotQueueAnywhere() {
  findAllQueueElements().forEach(showCannotQueue);
}

function showFailedToQueueView(error) {
  findQueuingInstructionsElement().innerText = 'Sorry! Currently unavailable.';
}

function showCanQueueView() {
  findQueuingInstructionsElement().innerHTML =
    'Please select a queue and click a media button';
}

function showAlreadyQueuedView() {
  findQueuingInstructionsElement().innerText =
    'Please wait, you will be connected shortly';
}

function showCannotQueueView() {
  findQueuingInstructionsElement().innerText = 'Queueing is currently disabled';
}

function updateQueueAvailableMedia(queueElement, medias) {
  findMediaButtonsForQueue(queueElement).forEach(function(button) {
    var mediaUnavailable = medias.indexOf(getButtonMedium(button)) === -1;
      button.disabled = mediaUnavailable;
    console.log(getButtonMedium(button) + " is " + (mediaUnavailable ? "unavailable" : "available"));
    if (!mediaUnavailable) {
      button.classList.remove('disabled');
    } else {
      button.classList.add('disabled');
      //button.textContent += 'Currently unavailable';
    }
  });
}