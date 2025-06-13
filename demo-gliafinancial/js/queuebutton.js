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
};
