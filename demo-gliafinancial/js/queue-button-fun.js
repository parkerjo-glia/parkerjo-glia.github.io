// The following functions integrate an user interface with multiple queue
// buttons with Glia SDK.

var queueTicket; // Reference to an ongoing QueueTicket. Used for cancellation.

// Bind clicks on queue buttons with Glia SDK
function listenForQueueButtonClicks(salemove, queues) {
  findAllQueueMediaButtons().forEach(function (mediaButton) {
    // Gather properties from UI element
    var buttonQueueName = getMediaButtonQueueName(mediaButton);
    var buttonMedium = getButtonMedium(mediaButton);
    // Find queue ID by matching the queue name to button queue name
    var queueId = queues
      .filter(function (queue) {
        return queue.name === buttonQueueName;
      })
      .map(function (queue) {
        return queue.id;
      })[0];
    if (queueId === undefined) {
      throw new Error(
        'Queue button present, but queue not defined in Glia. Queue name: ' +
        buttonQueueName
      );
    }
    // Queue upon button click
    mediaButton.addEventListener('click', function () {
      if (buttonMedium === 'phone') {
        // text box element for the input with styling
        textBox = document.createElement("input");
        textBox.setAttribute("type", "text");
        textBox.setAttribute("id", "phoneNumberTextBox");
        textBox.classList.add("form-control", "input-md");
        textBox.style.marginTop = "10px";
        // submit button element to trigger the engagement request with styling
        submitButton = document.createElement("button");
        submitButton.setAttribute("id", "phoneNumberSubmitButton");
        submitButton.textContent = "Click here to engage";
        submitButton.classList.add("btn", "btn-default");
        document.getElementById("testAppend").textContent = "";
        // div element for the created elements
        buttonAddOn = document.createElement("div");
        buttonAddOn.innerHTML += 'Please insert your number:';
        buttonAddOn.style.color = "#000000";
        buttonAddOn.appendChild(textBox);
        buttonAddOn.appendChild(submitButton);
        // disable the button element and add the div inside the button element
        document.getElementById("testAppend").disabled = true;
        document.getElementById("testAppend").appendChild(buttonAddOn);
        submitButton.addEventListener("click", function () {
          var visitorPhoneNumber = document.getElementById("phoneNumberTextBox").value;
          // trigger the engagement request and set the phone button values back to the original state
          document.getElementById("testAppend").removeChild(buttonAddOn);
          document.getElementById("testAppend").disabled = false;
          document.getElementById("testAppend").textContent = "Have a representative call you directly";
          salemove
            .queueForEngagement(buttonMedium, {
              queueId: queueId,
              phoneNumber: visitorPhoneNumber
            }).catch(showFailedToQueueView);
        });
      } else {
        salemove
          .queueForEngagement(buttonMedium, { queueId: queueId })
          .catch(showFailedToQueueView);
      }
    });
  });
}

// Bind click on cancel button with QueueTicket cancellation
function listenForCancel() {
  findCancelButton().addEventListener('click', function () {
    if (queueTicket) {
      queueTicket.cancel();
    } else {
      throw new Error('Cannot cancel queuing while not queued');
    }
  });
}

// Handle queue state changes for a particular queue.
// Enable queuing and media buttons for available media if open, disable
// otherwise.
function onQueueState(queue) {
  if (findQueueElement(queue.name) === null) {
    // Queue not related to the current page, ignore
  } else if (queue.state.status === queue.state.STATUSES.OPEN) {
    showCanQueue(findQueueElement(queue.name), queue.state.medias);
    console.log(queue.name + " is online");
  } else {
    showCannotQueue(findQueueElement(queue.name));
    console.log(queue.name + " is offline");
  }
}

// Handle general visitor queuing state changes.
// Adapt this function to match your desired user interface.
// Note that these changes are for a particular visitor and must not conflict
// with the state that is written in `onQueueState` listener. Here two
// different dimensions, disabled and hidden, are used to avoid conflicts.
function onVisitorQueueingState(queuingState) {
  // Disable queuing if visitor is already queued.
  if (queuingState.state === queuingState.QUEUE_STATES.QUEUED) {
    queueTicket = queuingState.ticket;
    findAllQueueElements().forEach(hide);
    show(findCancelButton());
    showAlreadyQueuedView();
  } else if (queuingState.state === queuingState.QUEUE_STATES.CANNOT_QUEUE) {
    // Disable queueing when queueing state changed to `CANNOT_QUEUE`
    // which can happen due do various reasons.
    // See the full list of possible transition reasons in our JS SDK
    // https://sdk-docs.glia.com/visitor-js-api/current/class/AggregateQueueState.html#TRANSITION_REASONS-variable
    queueTicket = null;
    findAllQueueElements().forEach(hide);
    hide(findCancelButton());
    showCannotQueueView();
  } else {
    // Enable queuing otherwise
    queueTicket = null;
    findAllQueueElements().forEach(show);
    hide(findCancelButton());
    showCanQueueView();
  }
}

// Initial state: Cannot queue and cannot cancel
showCannotQueueAnywhere();
hide(findCancelButton());

// Get Glia SDK and bind listeners.
window.addEventListener('glia-installed', function () {
  sm.getApi({ version: 'v1' }).then(function (salemove) {
    salemove.addEventListener(
      salemove.EVENTS.QUEUE_STATE_UPDATE,
      // onVisitorQueueingState
    );
    listenForCancel();

    salemove.getQueues().then(function (queues) {
      listenForQueueButtonClicks(salemove, queues);

      var queueIds = queues.map(function (queue) {
        return queue.id;
      });
      salemove.subscribeToQueueStateUpdates(queueIds, onQueueState);
    });
  });
});