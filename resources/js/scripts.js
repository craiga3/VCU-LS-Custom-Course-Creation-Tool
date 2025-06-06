/**
 * Initiates the OAuth2 flow for Canvas login.
 * Fetches an authorization URL from the Google Apps Script backend and redirects the user.
 * Handles UI updates for the authorize button during the process.
 */
function authorize() {
  var authorizeButton = document.getElementById('authorize-btn');

  if (!authorizeButton) {
    console.error('Authorize button not found');
    return;
  }

  // Disable the button and change its appearance using the class
  setButtonState(authorizeButton, 'Launching Canvas for Login', { isLoading: true, isDisabled: true, addClass: 'blue' });

  // Send a POST request to your Apps Script endpoint for login
  fetch('https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'action=login&accessToken=NULL'
  })
    .then(response => response.json())
    .then(data => {
      if (data.authorizationUrl) {
        // Navigate to the authorization URL in the same window/tab
        window.location.href = data.authorizationUrl;
      } else {
        console.error("Error during login:", data.error); // Log the error
      }
    })
    .catch(error => {
      console.error('Error fetching authorization URL:', error);

      // Re-enable the button and reset its appearance in case of an error
      setButtonState(authorizeButton, 'Authorize Canvas Login', { isLoading: false, isDisabled: false, removeClass: 'loading blue' });
    });
}

/**
 * Helper function to manage button states (text, disabled, loading, classes, opacity).
 * @param {HTMLElement} button - The button element to modify.
 * @param {string} text - The text to display on the button.
 * @param {object} [options={}] - Optional parameters.
 * @param {boolean} [options.isLoading=false] - If true, adds 'loading' class. Removes if false.
 * @param {boolean} [options.isDisabled=true] - Sets button.disabled and adjusts opacity/cursor.
 * @param {string} [options.addClass=''] - Space-separated string of classes to add.
 * @param {string} [options.removeClass=''] - Space-separated string of classes to remove.
 */
function setButtonState(button, text, { isLoading = false, isDisabled = true, addClass = '', removeClass = '' } = {}) {
  if (!button) return;

  button.innerHTML = text;
  button.disabled = isDisabled;

  // Handle opacity based on disabled state for consistency with existing logic
  if (isDisabled) {
    button.style.cursor = 'not-allowed';
    button.style.opacity = '0.5';
  } else {
    button.style.cursor = 'pointer';
    button.style.opacity = '1';
  }

  if (isLoading) {
    button.classList.add('loading');
  } else {
    button.classList.remove('loading');
  }

  if (removeClass) {
    removeClass.split(' ').forEach(cls => cls && button.classList.remove(cls));
  }
  if (addClass) {
    addClass.split(' ').forEach(cls => cls && button.classList.add(cls));
  }
}

/**
 * Displays the initial course type selection screen.
 * Users can choose between Sandbox, Training, Primary, or Catalog course types.
 */
function displayTypeOptions() {
  // Disable the 'Next' button (from the initial informational page) while loading this view
  var nextButton = document.querySelector('.buttonmain');
  setButtonState(nextButton, 'Loading', { isLoading: true, isDisabled: true, addClass: 'blue' });

  // Get the container element to replace its content
  var processContainer = document.getElementById('process-container');

  // Clear existing content
  processContainer.innerHTML = '';

  // Add a header for the section
  var header = document.createElement('h2');
  header.textContent = 'Select an Option';
  processContainer.appendChild(header);

  // Create a grid container for the buttons
  var gridContainer = document.createElement('div');
  gridContainer.className = 'grid-container';

  // Define button options
  var buttonOptions = [
    {
      text: 'Sandbox Course Shell',
      title: 'Create a sandbox course shell for testing purposes',
      onClick: () => handleButtonClick('Sandbox'),
    },
    {
      text: 'Training Course Shell',
      title: 'Create a training course shell for instructional purposes',
      onClick: () => handleButtonClick('Training'),
    },
    {
      text: 'Primary Course Template Shell',
      title: 'Create a Primary course copy shell for template purposes',
      onClick: () => handleButtonClick('Primary'),
    },
    /*    { 
          text: 'Canvas Catalog Course Shell',
          title: 'Create a Canvas Catalog course shell for public-facing courses',
          onClick: () => handleButtonClick('Catalog'),
        },
    */
  ];

  // Function to handle button clicks and store the variable
  function handleButtonClick(option) {
    // Store the selected option in sessionStorage
    sessionStorage.setItem('selectedOption', option);
    // Pass the selection to courseConfigSelection
    courseConfigSelection(option);
  }

  // Create buttons and add them to the grid container
  buttonOptions.forEach((option) => {
    var button = document.createElement('button');
    button.className = 'buttonmain';
    button.textContent = option.text;
    button.title = option.title;
    button.onclick = option.onClick;
    gridContainer.appendChild(button);
  });

  // Add the grid container to the process container
  processContainer.appendChild(gridContainer);

  // Re-enable the 'Next' button
  setButtonState(nextButton, 'Next', { isLoading: false, isDisabled: false, removeClass: 'blue loading' });
}

/**
 * Routes the user to the appropriate handler function based on the selected course type.
 * This function acts as a controller after the user selects a course type.
 * @param {string} selectedOption - The course type selected by the user (e.g., 'Sandbox', 'Training').
 */
function courseConfigSelection(selectedOption) {
  // Disable the 'Next' button (potentially from a previous screen, or the main one if an error occurs)
  var nextButton = document.querySelector('.buttonmain');
  setButtonState(nextButton, 'Loading', { isLoading: true, isDisabled: true, addClass: 'blue' });

  // Use the passed selectedOption, or fallback to sessionStorage
  var option = selectedOption || sessionStorage.getItem('selectedOption');

  // Switch case for action based on selected option
  switch (option) {
    case 'Sandbox':
      handleSandboxSelection();
      break;
    case 'Training':
      handleTrainingSelection();
      break;
    case 'Primary':
      handlePrimarySelection();
      break;
    case 'Catalog':
      handleCatalogSelection();
      break;
    default:
      console.error('No valid course type selected');
      // Re-enable the 'Next' button if no valid option is selected
      setButtonState(nextButton, 'Next', { isLoading: false, isDisabled: false, removeClass: 'blue loading' });
      return;
  }
}

/**
 * Handles the UI and logic for Sandbox course creation.
 * Displays guidelines, requires user agreement, and checks for existing sandbox courses (SBCheck API).
 */
function handleSandboxSelection() {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  var header = document.createElement('h2');
  header.textContent = 'Sandbox Course Shell Creation';
  processContainer.appendChild(header);

  var instructions = document.createElement('div');
  instructions.innerHTML = `
  <h3>Please Read the following guidelines and restrictions</h3>
  <ul>
    <li>Sandbox course shells are intended for testing and development purposes.</li>
    <li>Sandbox courses are not intended for student enrollment.</li>
    <li>Sandbox Courses are not intended for training or instructional purposes.</li>
    <li>Sandbox courses will not be listed in Canvas Catalog.</li>
    <li>Sandbox courses are not subject to the same restrictions as other course types.</li>
    <li>Sandbox courses can be used to test new features, plugins, and integrations.</li>
    <li>Sandbox courses will follow a specific naming convention: "Sandbox - [Course Name]".</li>
    <li>Sandbox courses are limited to a maximum of 1 per user.</li>
  </ul>
  `;
  processContainer.appendChild(instructions);

  // Add the "I agree" input box
  var agreeDiv = document.createElement('div');
  agreeDiv.style.marginTop = '1em';

  var agreeLabel = document.createElement('label');
  agreeLabel.textContent = 'Type "I agree" to continue: ';
  agreeLabel.setAttribute('for', 'agree-input');
  agreeDiv.appendChild(agreeLabel);

  var agreeInput = document.createElement('input');
  agreeInput.type = 'text';
  agreeInput.id = 'agree-input';
  agreeInput.placeholder = 'I agree';
  agreeInput.autocomplete = 'off';
  agreeInput.className = 'textinput';
  agreeDiv.appendChild(agreeInput);

  processContainer.appendChild(agreeDiv);

  // Previous button
  var previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.innerHTML = 'Previous';
  previousButton.onclick = function () {
    sessionStorage.removeItem('selectedOption');
    displayTypeOptions();
  };

  // Next button
  var nextButton = document.createElement('button');
  nextButton.className = 'buttonmain next';
  setButtonState(nextButton, 'Next', { isDisabled: true });

  // Enable Next button only if input is "I agree" (case-insensitive)
  agreeInput.addEventListener('input', function () {
    if (agreeInput.value.trim().toLowerCase() === 'i agree') {
      setButtonState(nextButton, 'Next', { isDisabled: false });
    } else {
      setButtonState(nextButton, 'Next', { isDisabled: true });
    }
  });

  // Create the button row container and append buttons
  var buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(previousButton);
  buttonRow.appendChild(nextButton);

  // Append the button row to the process container
  processContainer.appendChild(buttonRow);

  // --- SBCheck API Call: Checks if the user already has a sandbox course ---
  var accessToken = sessionStorage.getItem('accessToken');
  // Always set the button state to "Checking..." before the API call
  setButtonState(nextButton, 'Checking...', { isLoading: true, isDisabled: true });

  fetch('https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'action=SBCheck&accessToken=' + encodeURIComponent(accessToken)
  })
    .then(response => response.json())
    .then(data => {
      setButtonState(nextButton, 'Next', { isLoading: false, isDisabled: false });
      nextButton.onclick = function () {
        if (agreeInput.value.trim().toLowerCase() !== 'i agree') return;
        if (data.sb === false) {
          courseConfig();
        } else if (data.sb === true) {
          handleSandboxExistsPage(data.sbCourses);
        }
      };
    })
    .catch(error => {
      console.error('Error checking for existing Sandbox course:', error);
      setButtonState(nextButton, 'Error', { isLoading: false, isDisabled: true });
    });
}

/**
 * Displays options if a user already has one or more Sandbox courses.
 * Allows the user to choose to Reset or Delete an existing sandbox course.
 * @param {Array} sbCourses - An array of sandbox course objects (name, id) belonging to the user.
 */
function handleSandboxExistsPage(sbCourses) {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  var header = document.createElement('h2');
  header.textContent = 'Sandbox Course Already Exists';
  processContainer.appendChild(header);

  // Show the list of existing sandbox courses
  var message = document.createElement('div');
  if (Array.isArray(sbCourses) && sbCourses.length > 0) {
    let courseList = '<ul>';
    sbCourses.forEach(course => {
      courseList += `<li><strong>${course.name}</strong> (ID: ${course.id})</li>`;
    });
    courseList += '</ul>';
    message.innerHTML = `
        <p>You already have a Sandbox course. You may choose to reset or delete your existing Sandbox course before creating a new one.</p>
        ${courseList}
        <ul>
          <li><strong>Reset</strong>: Clears all content from your existing Sandbox course but keeps the course shell.</li>
          <li><strong>Delete</strong>: Permanently deletes your existing Sandbox course.</li>
        </ul>
      `;
  } else {
    message.innerHTML = `<p>No Sandbox courses found.</p>`;
  }
  processContainer.appendChild(message);

  // Use the first sandbox course for actions (if multiple, you can adapt this to allow selection)
  var courseID = sbCourses && sbCourses[0] ? sbCourses[0].id : null;
  var courseName = sbCourses && sbCourses[0] ? sbCourses[0].name : '';
  var accessToken = sessionStorage.getItem('accessToken');

  // Add Reset and Delete buttons
  var resetButton = document.createElement('button');
  resetButton.className = 'buttonmain';
  resetButton.innerHTML = 'Reset Sandbox Course';
  resetButton.disabled = !courseID;
  resetButton.onclick = function () {
    if (!courseID) return;
    // Show confirmation dialog before resetting
    showResetConfirmation(courseID, accessToken, courseName);
  };

  var deleteButton = document.createElement('button');
  deleteButton.className = 'buttonmain';
  deleteButton.innerHTML = 'Delete Sandbox Course';
  deleteButton.disabled = !courseID;
  deleteButton.onclick = function () {
    if (!courseID) return;
    // Show confirmation dialog before deleting
    showDeleteConfirmation(courseID, accessToken, courseName);
  };

  var previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.innerHTML = 'Previous';
  previousButton.onclick = handleSandboxSelection;

  var buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(resetButton);
  buttonRow.appendChild(deleteButton);
  buttonRow.appendChild(previousButton);

  processContainer.appendChild(buttonRow);
}

/** Displays confirmation screen for deleting a course 
   * @param {string} courseID - The ID of the course to be deleted.
  */
function showDeleteConfirmation(courseID, accessToken, courseName) {
    var processContainer = document.getElementById('process-container');
    processContainer.innerHTML = '';
    var header = document.createElement('h2');
    header.textContent = 'Confirm Delete';
    processContainer.appendChild(header);

    var message = document.createElement('div');
    message.innerHTML = `<p>Are you sure you want to <strong>permanently delete</strong> the course <strong>${courseName}</strong> (ID: ${courseID})? This action cannot be undone.</p>`;
    processContainer.appendChild(message);

    var confirmButton = document.createElement('button');
    confirmButton.className = 'buttonmain';
    confirmButton.innerHTML = 'Yes, Delete Course';
    confirmButton.onclick = function () {
      setButtonState(confirmButton, 'Deleting...', { isLoading: true, isDisabled: true });
      fetch('https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=SBActions&task=delete&courseID=${encodeURIComponent(courseID)}&accessToken=${encodeURIComponent(accessToken)}`
      })
        .then(response => response.json())
        .then(data => {
          if (data && data.delete === true) {
            sessionStorage.removeItem('sbCourseID');
            processContainer.innerHTML = `<h2>Sandbox Deleted</h2><p>Your Sandbox course has been deleted. You may now create a new Sandbox course.</p>`;
            setTimeout(() => {
              handleSandboxSelection();
            }, 2000);
          } else if (data.error) {
            processContainer.innerHTML = `<h2>Error</h2><p>${data.error}</p>`;
          } else {
            processContainer.innerHTML = `<h2>Unexpected Response</h2><pre>${JSON.stringify(data)}</pre>`;
          }
        })
        .catch(error => {
          processContainer.innerHTML = `<h2>Request Failed</h2><p>${error.message}</p>`;
          setButtonState(confirmButton, 'Yes, Delete Course', { isLoading: false, isDisabled: false });
        });
    };

    var previousButton = document.createElement('button');
    previousButton.className = 'buttonmain previous';
    previousButton.innerHTML = 'Go Back';
    previousButton.onclick = function () {
      // Go back to the sandbox exists page
      fetch('https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=SBCheck&accessToken=' + encodeURIComponent(accessToken)
      })
        .then(response => response.json())
        .then(data => {
          handleSandboxExistsPage(data.sbCourses);
        })
        .catch(() => {
          handleSandboxExistsPage([]);
        });
  };

  var buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(confirmButton);
  buttonRow.appendChild(previousButton);

  processContainer.appendChild(buttonRow);
}

/**
 * Displays a confirmation dialog before resetting a sandbox course.
 * @param {string} courseID - The ID of the course to be reset.
 * @param {string} accessToken - The user's access token for API calls.
 * @param {string} courseName - The name of the course to be reset.
 */
function showResetConfirmation(courseID, accessToken, courseName) {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  var header = document.createElement('h2');
  header.textContent = 'Confirm Reset';
  processContainer.appendChild(header);

  var message = document.createElement('div');
  message.innerHTML = `<p>Are you sure you want to reset the course <strong>${courseName}</strong> (ID: ${courseID})? This will clear all content but keep the course shell.</p>`;
  processContainer.appendChild(message);

  var confirmButton = document.createElement('button');
  confirmButton.className = 'buttonmain';
  confirmButton.innerHTML = 'Yes, Reset Course'; // Initial text before click
  confirmButton.onclick = function () {
    setButtonState(confirmButton, 'Resetting...', { isLoading: true, isDisabled: true });
    fetch('https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `action=SBActions&task=reset&courseID=${encodeURIComponent(courseID)}&accessToken=${encodeURIComponent(accessToken)}`
    })
      .then(response => response.json())
      .then(data => {
        // Show the same results as after submitting showConfirmationPage
        showResetResult(data);
      })
      .catch(error => {
        processContainer.innerHTML = `<h2>Request Failed</h2><p>${error.message}</p>`;
        // Re-enable button if the view didn't change
        setButtonState(confirmButton, 'Yes, Reset Course', { isLoading: false, isDisabled: false });
      });
  };

  var previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.innerHTML = 'Previous';
  previousButton.onclick = function () {
    // Go back to the sandbox exists page
    // You may want to re-fetch sbCourses if needed, or pass them along
    fetch('https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'action=SBCheck&accessToken=' + encodeURIComponent(accessToken)
    })
      .then(response => response.json())
      .then(data => {
        handleSandboxExistsPage(data.sbCourses);
      })
      .catch(() => {
        handleSandboxExistsPage([]);
      });
  };

  var buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(confirmButton);
  buttonRow.appendChild(previousButton);

  processContainer.appendChild(buttonRow);
}

/**
 * Displays the result of a sandbox course reset attempt.
 * @param {object} data - The response data from the reset API call.
 *                         Expected to have data.id and data.name on success, or data.error on failure.
 */
function showResetResult(data) {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  if (data.error) {
    processContainer.innerHTML = '<h2>Error Resetting Course</h2><p>' + data.error + '</p>';
  } else if (data.id && data.name) {
    // Optionally, you can add a link if you have data.link
    processContainer.innerHTML = '<h2>Course Reset Successfully!</h2><p>Name: ' + data.name + '</p><p>ID: ' + data.id + '</p>' + '</p>' +
      (data.link ? '<p><a href="' + data.link + '" target="_blank">View Course</a></p>' : '');
  } else {
    processContainer.innerHTML = '<h2>Unexpected Response</h2><p>The server responded in an unexpected way. Please check the logs.</p>';
    console.error('Unexpected server response:', data);
  }
}

/**
 * Handles the UI and logic for Training course creation.
 * Displays guidelines and requires user agreement before proceeding.
 */
function handleTrainingSelection() {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  var header = document.createElement('h2');
  header.textContent = 'Training Course Shell Creation';
  processContainer.appendChild(header);

  var instructions = document.createElement('div');
  instructions.innerHTML = `
    <h3>Please Read the following guidelines and restrictions</h3>
    <ul>
      <li>Training course shells are intended for training and instructional purposes.</li>
      <li>Training courses are not intended for Academic use.</li>
      <li>Training Course enrollments may be able to have enrollments automated, email <a href="mailto:LSRequest@vcu.edu?subject=Training%20Course%20Enrollment%20Automation" target="_blank">VCU Learning Systems</a> for more information.</li>
      <li>Training courses are restricted to internal users only.</li>
      <li>Training Courses are NOT for long term document storage, please email <a href="mailto:drgee@vcu.edu?subject=Long%20Term%20Storage%20Question" target="_blank">Dr. Gee</a> for more information.</li>
    </ul>
  `;
  processContainer.appendChild(instructions);

  // Add the "I agree" input box
  var agreeDiv = document.createElement('div');
  agreeDiv.style.marginTop = '1em';

  var agreeLabel = document.createElement('label');
  agreeLabel.textContent = 'Type "I agree" to continue: ';
  agreeLabel.setAttribute('for', 'training-agree-input');
  agreeDiv.appendChild(agreeLabel);

  var agreeInput = document.createElement('input');
  agreeInput.type = 'text';
  agreeInput.id = 'training-agree-input';
  agreeInput.placeholder = 'I agree';
  agreeInput.autocomplete = 'off';
  agreeInput.className = 'textinput';
  agreeDiv.appendChild(agreeInput);

  processContainer.appendChild(agreeDiv);

  // Previous button
  var previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.innerHTML = 'Previous';
  previousButton.onclick = function () {
    sessionStorage.removeItem('selectedOption');
    displayTypeOptions();
  };

  // Next button
  var nextButton = document.createElement('button');
  nextButton.className = 'buttonmain next';
  setButtonState(nextButton, 'Next', { isDisabled: true });
  nextButton.onclick = courseConfig;

  // Enable Next button only if input is "I agree" (case-insensitive)
  agreeInput.addEventListener('input', function () {
    if (agreeInput.value.trim().toLowerCase() === 'i agree') {
      setButtonState(nextButton, 'Next', { isDisabled: false });
    } else {
      setButtonState(nextButton, 'Next', { isDisabled: true });
    }
  });

  // Create the button row container and append buttons
  var buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(previousButton);
  buttonRow.appendChild(nextButton);

  // Append the button row to the process container
  processContainer.appendChild(buttonRow);
}

/**
 * Handles the UI and logic for Primary course template creation.
 * Displays guidelines and requires user agreement before proceeding.
 */
function handlePrimarySelection() {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  var header = document.createElement('h2');
  header.textContent = 'Primary Course Template Creation';
  processContainer.appendChild(header);

  var instructions = document.createElement('div');
  instructions.innerHTML = `
    <h3>Please Read the following guidelines and restrictions</h3>
    <ul>
      <li>Primary Course Templates are for the continuous development of course materials.</li>
      <li>Primary Course Templates are not intended for student enrollment.</li>
      <li>Primary Course Templates are not intended for training or instructional purposes.</li>
      <li>Primary Course Templates will not be listed in Canvas Catalog.</li>
      <li>Primary Course Templates are not subject to the same restrictions as other course types.</li>
      <li>Primary Course Templates will follow a specific naming convention: "Primary - [SUBJ] - [CourseNum] - [EID] - [MM/YY]"</li>
    </ul>
  `;
  processContainer.appendChild(instructions);

  // Add the "I agree" input box
  var agreeDiv = document.createElement('div');
  agreeDiv.style.marginTop = '1em';

  var agreeLabel = document.createElement('label');
  agreeLabel.textContent = 'Type "I agree" to continue: ';
  agreeLabel.setAttribute('for', 'agree-input');
  agreeDiv.appendChild(agreeLabel);

  var agreeInput = document.createElement('input');
  agreeInput.type = 'text';
  agreeInput.id = 'agree-input';
  agreeInput.placeholder = 'I agree';
  agreeInput.autocomplete = 'off';
  agreeInput.className = 'textinput';
  agreeDiv.appendChild(agreeInput);

  processContainer.appendChild(agreeDiv);

  // Previous button
  var previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.innerHTML = 'Previous';
  previousButton.onclick = function () {
    sessionStorage.removeItem('selectedOption');
    displayTypeOptions();
  };

  // Next button
  var nextButton = document.createElement('button');
  nextButton.className = 'buttonmain next';
  setButtonState(nextButton, 'Next', { isDisabled: true });
  nextButton.onclick = courseConfig;

  // Enable Next button only if input is "I agree" (case-insensitive)
  agreeInput.addEventListener('input', function () {
    if (agreeInput.value.trim().toLowerCase() === 'i agree') {
      setButtonState(nextButton, 'Next', { isDisabled: false });
    } else {
      setButtonState(nextButton, 'Next', { isDisabled: true });
    }
  });

  // Create the button row container and append buttons
  var buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(previousButton);
  buttonRow.appendChild(nextButton);

  // Append the button row to the process container
  processContainer.appendChild(buttonRow);
}

/**
 * Handles the UI and logic for Canvas Catalog course shell creation.
 * (Note: This function appears to be a placeholder or incomplete in the original code.)
 * Displays guidelines before proceeding.
 */
function handleCatalogSelection() {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  var header = document.createElement('h2');
  header.textContent = 'Canvas Catalog Course Shell Creation';
  processContainer.appendChild(header);

  var instructions = document.createElement('div');
  instructions.innerHTML = `
  <h3>Please Read the following guidelines and restrictions</h3>
  <ul>
    <li>Catalog Stuff here</li>
  </ul>
  `;
  processContainer.appendChild(instructions);

  var previousButton = document.createElement('button');
  previousButton.className = 'buttonmain';
  previousButton.innerHTML = 'Previous';
  previousButton.onclick = function () {
    sessionStorage.removeItem('selectedOption');
    displayTypeOptions();
  };

  var nextButton = document.createElement('button');
  nextButton.className = 'buttonmain';
  nextButton.innerHTML = 'Next';
  nextButton.onclick = function () {
    // Here you can add the logic for what happens when "Next" is clicked
    // For example, you might want to call a function to create the catalog course shell
    // You can also redirect to another function or page if needed
  };

  processContainer.appendChild(previousButton);
  processContainer.appendChild(nextButton);
}

/**
 * Displays the course configuration screen where users input details for the selected course type.
 * This includes course name, and for 'Primary' type, subject and course number.
 * It also provides a live preview of the generated course name.
 */
function courseConfig() {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  // Display the selected course type from sessionStorage
  var selectedType = sessionStorage.getItem('selectedOption') || '';

  // Header
  var header = document.createElement('h2');
  header.textContent = 'Course Configuration';
  processContainer.appendChild(header);

  // Show selected course type
  var typeLabel = document.createElement('p');
  typeLabel.innerHTML = `<strong>Course Type Selected:</strong> ${selectedType}`;
  processContainer.appendChild(typeLabel);

  // Get user info
  var userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
  var loginID = userInfo.userProfile && userInfo.userProfile.login_id ? userInfo.userProfile.login_id : '';

  // Get MM/YY
  var now = new Date();
  var mm = String(now.getMonth() + 1).padStart(2, '0');
  var yy = String(now.getFullYear()).slice(-2);
  var mmYY = mm + '/' + yy; // Formatted month and year for naming conventions

  // Variables for input elements that might be created
  var nameInput, subjInput, numInput, previewDiv;

  // Dynamically create input fields based on the selected course type
  switch (selectedType) {
    case 'Primary':
      // Inputs for Subject, Course Number, and Course Name for 'Primary' type
      // Subject input
      var subjLabel = document.createElement('label');
      subjLabel.setAttribute('for', 'subject-input');
      subjLabel.textContent = 'Subject:';
      processContainer.appendChild(subjLabel);

      subjInput = document.createElement('input');
      subjInput.type = 'text';
      subjInput.id = 'subject-input';
      subjInput.className = 'textinput';
      subjInput.placeholder = 'e.g. MATH';
      subjInput.autocomplete = 'off';
      subjInput.maxLength = 4; // Limit to 4 characters
      subjInput.style.display = 'block';
      subjInput.style.marginBottom = '1em';
      processContainer.appendChild(subjInput);

      // Course Number input
      var numLabel = document.createElement('label');
      numLabel.setAttribute('for', 'course-num-input');
      numLabel.textContent = 'Course Number:';
      processContainer.appendChild(numLabel);

      numInput = document.createElement('input');
      numInput.type = 'text';
      numInput.id = 'course-num-input';
      numInput.className = 'textinput';
      numInput.placeholder = 'e.g. 101';
      numInput.autocomplete = 'off';
      numInput.maxLength = 3; // Limit to 3 characters
      numInput.style.display = 'block';
      numInput.style.marginBottom = '1em';
      processContainer.appendChild(numInput);

      // Course Name input
      nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.id = 'course-name-input';
      nameInput.className = 'textinput';
      nameInput.placeholder = 'Course Name';
      nameInput.autocomplete = 'off';
      nameInput.style.display = 'block';
      nameInput.style.marginBottom = '1em';
      processContainer.appendChild(nameInput);

      // Preview area
      previewDiv = document.createElement('div');
      previewDiv.style.margin = '0.5em 0 1em 0';
      previewDiv.style.fontStyle = 'italic';
      previewDiv.style.color = '#000';
      processContainer.appendChild(previewDiv);

      // Update preview function: Dynamically shows how the course name will look.
      function updatePrimaryPreview() {
        // Always use uppercase for subject and course number
        var subj = subjInput.value.trim().toUpperCase();
        var num = numInput.value.trim().toUpperCase();
        var courseName = nameInput.value.trim();
        let previewText = `Primary - ${subj || '[SUBJ]'} - ${num || '[CourseNum]'} - ${courseName || '[CourseName]'} - ${loginID} - ${mmYY}`;
        previewDiv.textContent = `Preview: ${previewText}`;
      }

      subjInput.addEventListener('input', function () {
        // Force uppercase and limit to 4 chars
        this.value = this.value.toUpperCase().slice(0, 4);
        updatePrimaryPreview();
      });
      numInput.addEventListener('input', function () {
        // Force uppercase and limit to 3 chars
        this.value = this.value.toUpperCase().slice(0, 3);
        updatePrimaryPreview();
      });
      nameInput.addEventListener('input', updatePrimaryPreview);
      updatePrimaryPreview(); // Initial preview update

      break;

    case 'Sandbox':
      // Input only for Course Name for 'Sandbox' type
      var nameLabel = document.createElement('label');
      nameLabel.setAttribute('for', 'course-name-input');
      nameLabel.textContent = 'Give your course a name:';
      processContainer.appendChild(nameLabel);
      // Only Course Name input (already created above)
      nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.id = 'course-name-input';
      nameInput.className = 'textinput';
      nameInput.placeholder = 'Course Name';
      nameInput.autocomplete = 'off';
      nameInput.style.display = 'block';
      nameInput.style.marginBottom = '1em';
      processContainer.appendChild(nameInput);

      // Preview area
      previewDiv = document.createElement('div');
      previewDiv.style.margin = '0.5em 0 1em 0';
      previewDiv.style.fontStyle = 'italic';
      previewDiv.style.color = '#000';
      processContainer.appendChild(previewDiv);

      function updateSandboxPreview() {
        var courseName = nameInput.value.trim();
        let previewText = courseName ? `Sandbox - ${courseName}` : 'Sandbox - [Course Name]';
        previewDiv.textContent = `Preview: ${previewText}`;
      }

      nameInput.addEventListener('input', updateSandboxPreview);
      updateSandboxPreview(); // Initial preview update

      break;

    default: // Handles 'Training' and any other non-Primary, non-Sandbox types
      // Input only for Course Name for other types like 'Training'
      var nameLabel = document.createElement('label');
      nameLabel.setAttribute('for', 'course-name-input');
      nameLabel.textContent = 'Give your course a name:';
      processContainer.appendChild(nameLabel);
      // Training and any other types: Only Course Name input
      nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.id = 'course-name-input';
      nameInput.className = 'textinput';
      nameInput.placeholder = 'Course Name';
      nameInput.autocomplete = 'off';
      nameInput.style.display = 'block';
      nameInput.style.marginBottom = '1em';
      processContainer.appendChild(nameInput);

      // Preview area
      previewDiv = document.createElement('div');
      previewDiv.style.margin = '0.5em 0 1em 0';
      previewDiv.style.fontStyle = 'italic';
      previewDiv.style.color = '#000';
      processContainer.appendChild(previewDiv);

      function updateDefaultPreview() {
        var courseName = nameInput.value.trim();
        let previewText = courseName ? `${selectedType} - ${courseName}` : `${selectedType} - [Course Name]`;
        previewDiv.textContent = `Preview: ${previewText}`;
      }

      nameInput.addEventListener('input', updateDefaultPreview);
      updateDefaultPreview();

      break;
  }

  // Previous button
  var previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.innerHTML = 'Previous';
  previousButton.onclick = function () {
    var selectedOption = sessionStorage.getItem('selectedOption');
    if (selectedOption === 'Sandbox') {
      handleSandboxSelection();
    } else if (selectedOption === 'Training') {
      handleTrainingSelection();
    } else if (selectedOption === 'Primary') {
      handlePrimarySelection();
    } else if (selectedOption === 'Catalog') {
      handleCatalogSelection();
    } else {
      displayTypeOptions();
    }
  };

  // Next button
  var nextButton = document.createElement('button');
  nextButton.className = 'buttonmain next';
  setButtonState(nextButton, 'Next', { isDisabled: true });

  // Enable Next button only if required fields are filled
  if (selectedType === 'Primary') {
    function checkPrimaryFields() {
      if (
        subjInput.value.trim().length > 0 &&
        numInput.value.trim().length > 0 &&
        nameInput.value.trim().length > 0
      ) {
        setButtonState(nextButton, 'Next', { isDisabled: false });
      } else {
        setButtonState(nextButton, 'Next', { isDisabled: true });
      }
    }
    subjInput.addEventListener('input', checkPrimaryFields);
    numInput.addEventListener('input', checkPrimaryFields);
    nameInput.addEventListener('input', checkPrimaryFields);
    checkPrimaryFields(); // Initial check

    nextButton.onclick = function () {
      var subj = subjInput.value.trim().toUpperCase();
      var num = numInput.value.trim();
      var courseName = nameInput.value.trim();
      // Pass the full preview string to confirmation
      var fullName = `Primary - ${subj} - ${num} - ${courseName} - ${loginID} - ${mmYY}`;
      showConfirmationPage(fullName); // This function will handle its own button states
    };
  } else { // For Sandbox, Training, etc.
    nameInput.addEventListener('input', function () {
      if (nameInput.value.trim().length > 0) {
        setButtonState(nextButton, 'Next', { isDisabled: false });
      } else {
        setButtonState(nextButton, 'Next', { isDisabled: true });
      }
    });
    nextButton.onclick = function () {
      var courseName = nameInput.value.trim();
      showConfirmationPage(courseName); // This function will handle its own button states
    };
  }

  // Create the button row container and append buttons
  var buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(previousButton);
  buttonRow.appendChild(nextButton);

  // Append the button row to the process container
  processContainer.appendChild(buttonRow);
}

/**
 * Displays a confirmation page summarizing the course details before final submission.
 * Constructs the payload that will be sent to the API for course creation.
 * @param {string} courseName - The fully constructed or user-inputted course name.
 */
function showConfirmationPage(courseName) {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  // Get apiToken and userInfo from sessionStorage
  var accessToken = sessionStorage.getItem('accessToken') || '';
  var userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
  var courseType = sessionStorage.getItem('selectedOption') || '';
  var instructorID = userInfo.userProfile && userInfo.userProfile.id ? userInfo.userProfile.id : '';
  var loginID = userInfo.userProfile && userInfo.userProfile.login_id ? userInfo.userProfile.login_id : '';
  var courseName = courseName || ''; // Ensure courseName is not undefined

  // Construct the payload object for the API request.
  var payload = {
    action: 'createCourse', // API action to trigger
    type: courseType,       // Selected course type (e.g., Sandbox, Training)
    accessToken: accessToken,
    course_name: courseName,
    instructorID: instructorID,
    instructorLoginID: loginID
  };

  // Header
  var header = document.createElement('h2');
  header.textContent = 'Confirm Your Course Request';
  processContainer.appendChild(header);

  // Summary
  var summary = document.createElement('div');
  summary.innerHTML = `
    <p><strong>Course Type:</strong> ${payload.type}</p>
    <p><strong>Course Name:</strong> ${courseName}</p>
  `;
  processContainer.appendChild(summary);

  var payloadString = Object.keys(payload)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]))
    .join('&');

  // Previous button
  var previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.innerHTML = 'Previous';
  previousButton.onclick = function () {
    courseConfig(); // Go back to course config page
  };

  // Submit button
  var submitButton = document.createElement('button');
  submitButton.className = 'buttonmain next';
  // Initial state before click
  setButtonState(submitButton, 'Submit', { isDisabled: false }); // Assuming it should be enabled initially

  submitButton.onclick = function () {
    // Disable button and show loading state on click
    setButtonState(this, 'Submitting...', { isLoading: true, isDisabled: true });
    submitCourseRequest(payloadString);
  };

  // Create the button row container and append buttons
  var buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(previousButton);
  buttonRow.appendChild(submitButton);

  // Append the button row to the process container
  processContainer.appendChild(buttonRow);
}

/**
 * Submits the course creation request to the Google Apps Script API.
 * Handles the response, displaying success or error messages.
 * @param {string} payloadString - The URL-encoded string of parameters for the API request.
 */
function submitCourseRequest(payloadString) {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  // Show loading
  var loading = document.createElement('p');
  loading.textContent = 'Submitting your request...';
  processContainer.appendChild(loading);

  // Define the URL for your API endpoint
  var apiUrl = 'https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec';

  // Make the POST request using fetch API
  fetch(apiUrl, {
    redirect: 'follow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payloadString,
  })
    .then(response => {
      if (!response.ok) {
        // Try to parse error from GAS if possible, or use statusText
        return response.json().catch(() => {
          throw new Error('Server responded with status: ' + response.statusText);
        }).then(errData => {
          throw new Error(errData.error || 'Server responded with status: ' + response.statusText);
        });
      }
      return response.json();
    })
    .then(data => {
      // Handle API response: success, known error, or unexpected structure.
      if (data.error) {
        processContainer.innerHTML = '<h2>Error Creating Course</h2><p>' + data.error + '</p>';
      } else if (data.id && data.name && data.link) { // Assuming these fields indicate success
        processContainer.innerHTML = '<h2>Course Created Successfully!</h2><p>Name: ' + data.name + '</p><p>ID: ' + data.id + '</p><p><a href="' + data.link + '" target="_blank">View Course</a></p>';

        // Add a "Start Over" button to allow users to create another course easily.
        var startOverButton = document.createElement('button');
        startOverButton.textContent = 'Start Over';
        startOverButton.className = 'buttonmain';
        startOverButton.onclick = displayTypeOptions;
        processContainer.appendChild(startOverButton);
      } else {
        // Handle unexpected response structure from the API.
        processContainer.innerHTML = '<h2>Unexpected Response</h2><p>The server responded in an unexpected way. Please check the logs.</p>';
        console.error('Unexpected server response:', data);
      }
    })
    .catch(error => {
      console.error('Error submitting course request:', error);
      processContainer.innerHTML = '<h2>Request Failed</h2><p>An error occurred while submitting your request: ' + error.message + '</p>';
    });
}

/**
 * Handles user logout by calling the Google Apps Script logout endpoint.
 * Clears session storage and resets the UI to the login state.
 */
function logout() {
  // Disable the 'Logout' button while processing
  var logoutButton = document.querySelector('.buttonmain.logout');
  setButtonState(logoutButton, 'Logging Out', { isLoading: true, isDisabled: true, addClass: 'logout' });

  // Retrieve access token from sessionStorage
  var accessToken = sessionStorage.getItem('accessToken');

  // Send a request to the Google Apps Script endpoint for logout
  fetch(
    'https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec',
    {
      redirect: 'follow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'action=logout' + '&accessToken=' + encodeURIComponent(accessToken),
    }
  )
    .then((response) => response.text()) // Get the text content from the response
    .then((message) => {


      // Check the response message and update the UI accordingly
      if (message === 'Logout successful') {
        sessionStorage.clear();
        // Clear the content of the screen except for the authorize button
        var contentDiv = document.getElementById('content');
        if (contentDiv) {
          contentDiv.innerHTML =
            '<h1>VCU Canvas Non-Academic Course Creation Tool</h1><p>Logout successful</p><button id="authorize-btn" class="buttonmain authorize" onclick="authorize()">Authorize Canvas Login</button>';
        } else {
          console.error('Content div not found');
        }
      } else {
        console.error('Logout failed');
      }
    })
    .catch((error) => {
      console.error('Logout error:', error);
    })
    .finally(() => {
      // Re-enable the 'Logout' button
      setButtonState(logoutButton, 'Logout', { isLoading: false, isDisabled: false, addClass: 'buttonmain logout', removeClass: 'loading' });
    });
}