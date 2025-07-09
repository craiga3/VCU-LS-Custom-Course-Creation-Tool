/**
 * @file scripts.js
 * Main JavaScript file for the VCU Canvas Non-Academic Course Creation Tool.
 * Handles UI interactions, API calls to Google Apps Script backend, and state management.
 */

/** @type {number} Counter for ongoing API calls to manage global loading states (e.g., logout button). */
let apiCallsInProgress = 0;

/**
 * Patches the global `fetch` function to track API calls.
 * Increments `apiCallsInProgress` before a request and decrements it after completion (success or failure).
 * Calls `updateLogoutButtonState` to disable/enable the logout button based on API activity.
 */
const originalFetch = window.fetch;
window.fetch = function(...args) {
  apiCallsInProgress++;
  updateLogoutButtonState(); // Disable logout before fetch starts
  return originalFetch.apply(this, args)
    .finally(() => {
      apiCallsInProgress = Math.max(0, apiCallsInProgress - 1); // Ensure counter doesn't go negative
      updateLogoutButtonState(); // Re-evaluate logout state after fetch completes or fails
    });
};

/**
 * Initiates the OAuth2 flow for Canvas login.
 * Fetches an authorization URL from the Google Apps Script backend and redirects the user.
 * Updates the authorize button UI during the process.
 */
function authorize() {
  const authorizeButton = document.getElementById('authorize-btn');
  if (!authorizeButton) {
    console.error('Authorize button not found (ID: authorize-btn).');
    return;
  }

  setButtonState(authorizeButton, 'Launching Canvas for Login...', { isLoading: true, isDisabled: true, addClass: 'blue' });

  fetch('https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'action=login&accessToken=NULL' // accessToken is NULL for initial login request
  })
    .then(response => response.json())
    .then(data => {
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl; // Redirect to Canvas for OAuth
      } else {
        console.error("Error during login initiation:", data.error || 'No authorizationUrl received.');
        setButtonState(authorizeButton, 'Authorize Canvas Login', { isLoading: false, isDisabled: false, removeClass: 'loading blue' });
        alert(`Login Error: ${data.error || 'Could not retrieve authorization URL. Please try again.'}`);
      }
    })
    .catch(error => {
      console.error('Error fetching authorization URL:', error);
      setButtonState(authorizeButton, 'Authorize Canvas Login', { isLoading: false, isDisabled: false, removeClass: 'loading blue' });
      alert('Failed to initiate login. Please check your connection and try again.');
    });
}

/**
 * Utility function to manage the state of a button element.
 * Updates text, disabled status, opacity, cursor, and CSS classes.
 * @param {HTMLElement} button - The button element to modify.
 * @param {string} text - The text to display on the button. Can include HTML.
 * @param {object} [options={}] - Optional parameters for button state.
 * @param {boolean} [options.isLoading=false] - If true, adds 'loading' class. Removes if false.
 * @param {boolean} [options.isDisabled=true] - Sets button.disabled and adjusts visual cues (opacity, cursor).
 * @param {string} [options.addClass=''] - Space-separated string of CSS classes to add.
 * @param {string} [options.removeClass=''] - Space-separated string of CSS classes to remove.
 */
function setButtonState(button, text, { isLoading = false, isDisabled = true, addClass = '', removeClass = '' } = {}) {
  if (!button || !(button instanceof HTMLElement)) {
    // console.warn('setButtonState called with invalid button element:', button); // Reduced console noise for common cases like initial page next button
    return;
  }

  button.innerHTML = text; // Use innerHTML to allow for icons or other HTML in button text
  button.disabled = isDisabled;

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
    removeClass.split(' ').forEach(cls => cls && button.classList.remove(cls.trim()));
  }
  if (addClass) {
    addClass.split(' ').forEach(cls => cls && button.classList.add(cls.trim()));
  }
}

/**
 * Displays the initial course type selection screen.
 * Users can choose between Sandbox, Training, or Primary course types.
 */
function displayTypeOptions() {
  // Attempt to find the "Next" button from the initial welcome/instructions page.
  // This button might not exist if displayTypeOptions is called from other contexts.
  const initialNextButton = document.querySelector('#process-container > .buttonmain:not(.previous):not(.next)');
  if (initialNextButton && initialNextButton.parentElement.id === 'process-container' && initialNextButton.textContent.toLowerCase().includes('next')) {
    setButtonState(initialNextButton, 'Loading...', { isLoading: true, isDisabled: true, addClass: 'blue' });
  }

  const processContainer = document.getElementById('process-container');
  processContainer.innerHTML = ''; // Clear previous content

  const header = document.createElement('h2');
  header.textContent = 'Select a Course Type';
  processContainer.appendChild(header);

  const gridContainer = document.createElement('div');
  gridContainer.className = 'grid-container';

  const buttonOptions = [
    { text: 'Sandbox Course Shell', title: 'Create a sandbox course for testing Canvas features (limit one per user).', onClick: () => handleCourseTypeSelection('Sandbox') },
    { text: 'Training Course Shell', title: 'Create a shell for offering training or development purposes.', onClick: () => handleCourseTypeSelection('Training') },
    { text: 'Primary Course Template Shell', title: 'Create a template shell for course development and master content (not for student enrollment).', onClick: () => handleCourseTypeSelection('Primary') },
    // { text: 'Canvas Catalog Course Shell', title: 'Create a Canvas Catalog course shell for public-facing courses', onClick: () => handleCourseTypeSelection('Catalog') },
  ];

  /**
   * Handles click on a course type button. Stores selection and proceeds to the specific handler.
   * @param {string} option - The selected course type (e.g., 'Sandbox').
   */
  function handleCourseTypeSelection(option) {
    sessionStorage.setItem('selectedOption', option);
    navigateToCourseSpecificHandler(option);
  }

  buttonOptions.forEach((opt) => {
    const button = document.createElement('button');
    button.className = 'buttonmain';
    button.textContent = opt.text;
    button.title = opt.title;
    button.onclick = opt.onClick;
    gridContainer.appendChild(button);
  });

  processContainer.appendChild(gridContainer);

  const prevButtonRow = document.createElement('div');
  prevButtonRow.className = 'button-row';
  // The .button-row class already has justify-content: center, which will center a single child.
  // No need for prevButtonRow.style.justifyContent = 'flex-start';
  prevButtonRow.style.marginTop = '20px';

  const previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.textContent = 'Previous (Back to Instructions)';
  previousButton.title = 'Return to the main instruction page.';
  previousButton.onclick = displayInitialInstructions;

  prevButtonRow.appendChild(previousButton);
  processContainer.appendChild(prevButtonRow);
}

/**
 * Displays the initial welcome and instructional content in the process container.
 * This function is called on page load for authenticated users and when navigating back to the start.
 */
function displayInitialInstructions() {
  const processContainer = document.getElementById('process-container');
  // Ensure container is visible, e.g. if previously hidden due to an error state.
  processContainer.style.display = 'block';
  processContainer.innerHTML = `
    <h2>How to use this tool</h2>
    <h4>Please read all instructions throughout fully and carefully.</h4>
    <p>The VCU Canvas Non-Academic course creation tool is made available to VCU faculty and staff who have at least
      one teacher role (past or current) in any Canvas course. </p>
    <ol type="1">
      <li>Read this page entirely.</li>
      <li>Select which type of course you would like to create.</li>
      <li>Read and agree to the guidelines and restrictions for the type of course you are requesting.</li>
      <li>Provide course information & Submit.</li>
      <li>A confirmation screen will appear with a link to your new course.</li>
    </ol>
    <h4>Type of courses that can be created using this tool:</h4>
    <ol>
      <li><b>Sandbox*: </b>For getting familiar with Canvas Functions and Features. Limited to one per user.</li>
      <li><b>Training: </b>For offering training.</li>
      <li><b>Primary Course Template*: </b>For course development & keeping a master copy of your course content.</li>
    </ol>
    <p>* These courses can be reset or deleted via Course Settings.</p>
    <p>Non-Academic course shells are subject to periodic audit.</p>
    <p>Using a Non-Academic shell for purposes against the guidelines and restrictions provided are subject to
      suspension.</p>
    <p class="reminder"><strong>Important:</strong> The unit or user requesting the creation of a course are
      responsible for maintaining all records as required by <a href="https://go.vcu.edu/records-management"
        target="_blank" rel="noopener noreferrer">VCU Records Management</a> and any and all superseding precedent.</p>
    <p class="reminder"> You can find more information regarding <a href="https://go.vcu.edu/records-ownership"
        target="_blank" rel="noopener noreferrer">records ownership here</a>. You can find more information regarding the specific data
      retention policies for <a
        href="https://learningsystems.vcu.edu/guidelines--procedures/records-management-policy--canvas-usage-at-vcu/"
        target="_blank" rel="noopener noreferrer">Canvas data retention here</a>.</p>
    <p class="reminder">You can find out more about where you can store certain types of data within VCU systems using
      the <a href="https://dms.vcu.edu" target="_blank" rel="noopener noreferrer">VCU Data Management System</a>.</p>
    <button class="buttonmain" onclick="displayTypeOptions()">Next</button>
  `;
  // Ensure the main container is visible if it was hidden
  processContainer.style.display = 'block';
}

/**
 * Routes to the appropriate UI handler function based on the selected course type.
 * @param {string} selectedOption - The course type selected by the user (e.g., 'Sandbox', 'Training').
 */
function navigateToCourseSpecificHandler(selectedOption) {
  const option = selectedOption || sessionStorage.getItem('selectedOption');

  switch (option) {
    case 'Sandbox': handleSandboxSelection(); break;
    case 'Training': handleTrainingSelection(); break;
    case 'Primary': handlePrimarySelection(); break;
    case 'Catalog': handleCatalogSelection(); break;
    default:
      console.error('Invalid course type for navigation:', option);
      alert('An invalid course type was selected. Please start over.');
      displayTypeOptions(); // Go back to options
      return;
  }
}

/**
 * Handles the UI and logic for Sandbox course creation.
 * Displays guidelines, requires user agreement via text input,
 * and performs an API check (`SBCheck`) for existing sandbox courses.
 * Implements an AbortController to cancel the API call if the user navigates away.
 */
function handleSandboxSelection() {
  const processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  const header = document.createElement('h2');
  header.textContent = 'Sandbox Course Shell Creation';
  processContainer.appendChild(header);

  const instructions = document.createElement('div');
  instructions.innerHTML = `
    <h3>Please Read the Following Guidelines and Restrictions</h3>
    <ul>
      <li>Sandbox course shells are intended for testing and development purposes.</li>
      <li>They are <strong>not</strong> intended for student enrollment or official training.</li>
      <li>Sandbox courses will be named: "Sandbox - [Your Chosen Name]".</li>
      <li>Limited to <strong>one</strong> Sandbox course per user. If you have one, you can reset or delete it.</li>
    </ul>`;
  processContainer.appendChild(instructions);

  const agreeDiv = document.createElement('div');
  agreeDiv.style.marginTop = '1em';
  const agreeLabel = document.createElement('label');
  agreeLabel.textContent = 'Type "I agree" to continue: ';
  agreeLabel.setAttribute('for', 'agree-input-sandbox'); // Unique ID for this context
  agreeDiv.appendChild(agreeLabel);
  const agreeInput = document.createElement('input');
  agreeInput.type = 'text';
  agreeInput.id = 'agree-input-sandbox';
  agreeInput.placeholder = 'I agree';
  agreeInput.autocomplete = 'off';
  agreeInput.className = 'textinput';
  agreeDiv.appendChild(agreeInput);
  processContainer.appendChild(agreeDiv);

  const previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.textContent = 'Previous';
  previousButton.onclick = () => {
    sessionStorage.removeItem('selectedOption'); // Clear selection before going back
    displayTypeOptions();
  };

  const nextButton = document.createElement('button');
  nextButton.className = 'buttonmain next';
  // Initial state: disabled. Text will change based on API call.
  setButtonState(nextButton, 'Next', { isDisabled: true });

  let sbCheckData = null; // To store data from SBCheck API
  let sbCheckCompleted = false; // Flag to track if SBCheck API call has finished

  /** Updates the Next button's state based on agreement text and API check status. */
  function updateNextButtonStateAfterApiAndAgreement() {
    const agreed = agreeInput.value.trim().toLowerCase() === 'i agree';

    if (!sbCheckCompleted) { // API call still in progress
      setButtonState(nextButton, 'Checking...', { isLoading: true, isDisabled: true });
      return;
    }

    // API call has completed (successfully or with error)
    if (agreed) {
      if (sbCheckData === null) { // API error occurred
        setButtonState(nextButton, 'Error. Retry?', { isLoading: false, isDisabled: false });
        nextButton.onclick = handleSandboxSelection; // Simple retry by re-running this handler
      } else { // API success
        setButtonState(nextButton, 'Next', { isLoading: false, isDisabled: false });
        nextButton.onclick = () => { // Define action for Next button
          if (agreeInput.value.trim().toLowerCase() !== 'i agree') return; // Re-validate agreement
          if (sbCheckData.sb === false) {
            courseConfig(); // Proceed to name the new sandbox
          } else if (sbCheckData.sb === true) {
            handleSandboxExistsPage(sbCheckData.sbCourses); // Manage existing sandbox(es)
          }
        };
      }
    } else { // Not agreed, regardless of API status (once completed)
      setButtonState(nextButton, 'Next', { isLoading: false, isDisabled: true });
    }
  }

  agreeInput.addEventListener('input', updateNextButtonStateAfterApiAndAgreement);

  // --- SBCheck API Call Initiation ---
  const accessToken = sessionStorage.getItem('accessToken');
  const abortController = new AbortController(); // Create an AbortController for this fetch call

  previousButton.onclick = () => {
    if (sbCheckCompleted === false && !abortController.signal.aborted) {
      abortController.abort(); // Abort the fetch if it's in progress
      console.log('SBCheck API call aborted by user navigating back.');
      // apiCallsInProgress will be decremented by the patched fetch's finally block
    }
    sessionStorage.removeItem('selectedOption');
    displayTypeOptions();
  };

  setButtonState(nextButton, 'Checking for existing Sandbox...', { isLoading: true, isDisabled: true });

  fetch('https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `action=SBCheck&accessToken=${encodeURIComponent(accessToken)}`,
    signal: abortController.signal // Pass the abort signal to fetch
  })
  .then(response => {
    if (!response.ok) throw new Error(`SBCheck API error: ${response.statusText}`);
    return response.json();
  })
  .then(data => {
    if (abortController.signal.aborted) return; // Don't process if aborted
    sbCheckData = data;
  })
  .catch(error => {
    if (error.name === 'AbortError') {
      // Fetch was aborted, no need to show an error message for this.
      // The finally block will still run.
      console.log('SBCheck fetch aborted.');
      sbCheckData = null; // Ensure data is null
      // Do not alert here, user initiated the abort.
    } else {
      console.error('Error checking for existing Sandbox course:', error);
      sbCheckData = null;
      alert(`Error checking your Sandbox status: ${error.message}. Please try again or contact support if the issue persists.`);
    }
  })
  .finally(() => {
    if (abortController.signal.aborted) {
        // If aborted, ensure apiCallsInProgress is handled correctly.
        // The patched fetch's finally will run. If it runs before this, apiCallsInProgress might be fine.
        // If this runs first, we must ensure the logout button state is updated if needed.
        // However, the patched fetch should handle decrementing apiCallsInProgress.
        // We just need to ensure sbCheckCompleted is set so UI doesn't hang.
        sbCheckCompleted = true; // Mark as completed even if aborted for UI logic
        updateNextButtonStateAfterApiAndAgreement(); // Update UI based on aborted state
        return; // Avoid further processing in finally if aborted
    }
    sbCheckCompleted = true;
    updateNextButtonStateAfterApiAndAgreement();
  });

  const buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(previousButton);
  buttonRow.appendChild(nextButton);
  processContainer.appendChild(buttonRow);
}


/**
 * Displays a page for managing existing Sandbox courses if the SBCheck API indicates the user has one or more.
 * Allows users to Reset or Delete their existing sandbox courses.
 * @param {Array<object>} sbCourses - An array of sandbox course objects (each with name, id) belonging to the user.
 */
function handleSandboxExistsPage(sbCourses) {
  const processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  const header = document.createElement('h2');
  header.textContent = 'Sandbox Course Management';
  processContainer.appendChild(header);

  const messageDiv = document.createElement('div');
  processContainer.appendChild(messageDiv);

  /** @returns {number} The count of non-deleted sandbox course rows currently in the table. */
  function getRemainingCoursesCount() {
    return Array.from(document.querySelectorAll('.sandbox-table tbody tr'))
      .filter(tr => tr.querySelector('.name-col')?.textContent !== 'Deleted').length;
  }

  /** Handles UI update and redirect when all sandbox courses are deleted. */
  function handleAllSandboxesDeleted() {
    processContainer.innerHTML = `
      <h2>All Sandbox Courses Deleted</h2>
      <p>You can now create a new Sandbox course. Redirecting in <span id="sb-redirect-timer">3</span> seconds...</p>`;
    let seconds = 3;
    const timerSpan = document.getElementById('sb-redirect-timer');
    const interval = setInterval(() => {
      seconds--;
      if (timerSpan) timerSpan.textContent = seconds.toString();
      if (seconds <= 0) {
        clearInterval(interval);
        courseConfig(); // Go back to the Sandbox agreement/check page to create a new one
      }
    }, 1000);
  }

  if (Array.isArray(sbCourses) && sbCourses.length > 0) {
    messageDiv.innerHTML = `
      <p>You currently have the following Sandbox course(s). You are limited to one. You can manage them below or go back to choose a different course type.</p>
      <ul>
        <li><strong>Reset</strong>: Clears all content from the Sandbox course but keeps the shell.</li>
        <li><strong>Delete</strong>: Permanently deletes the Sandbox course. This allows you to create a new one.</li>
      </ul>`;

    const table = document.createElement('table');
    table.className = 'sandbox-table';
    table.innerHTML = `<thead><tr><th style="width:60%;">Course Name</th><th style="width:40%;">Actions</th></tr></thead>`;
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    const userID = userInfo.userProfile?.id || '';
    const userLoginId = userInfo.userProfile?.login_id || '';
    const accessToken = sessionStorage.getItem('accessToken');

    sbCourses.forEach((course) => {
      const tr = tbody.insertRow(); // More direct way to add a row
      const nameTd = tr.insertCell();
      nameTd.className = 'name-col';
      nameTd.textContent = course.name;
      nameTd.id = `course-name-${course.id}`; // For potential updates

      const actionsTd = tr.insertCell();
      actionsTd.className = 'actions-col';

      const resetButton = document.createElement('button');
      resetButton.className = 'sandbox-reset-btn';
      resetButton.textContent = 'Reset';
      resetButton.style.marginRight = '10px';

      const deleteButton = document.createElement('button');
      deleteButton.className = 'sandbox-delete-btn';
      deleteButton.textContent = 'Delete';

      /**
       * Shows confirmation buttons (Confirm/Cancel) for an action within the table row.
       * @param {'reset' | 'delete'} actionType - The type of action to confirm.
       */
      function showActionConfirmation(actionType) {
        actionsTd.innerHTML = ''; // Clear existing Reset/Delete buttons

        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'sandbox-confirm-btn'; // Green for confirm
        confirmBtn.textContent = `Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`;
        confirmBtn.style.marginRight = '10px';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'sandbox-cancel-btn'; // Red for cancel
        cancelBtn.textContent = 'Cancel';

        confirmBtn.onclick = () => {
          setAllPageActionButtonsDisabled(true); // Disable all action buttons during API call

          performSandboxActionTableRow(course.id, accessToken, actionType, userID, userLoginId, (result) => {
            if (actionType === 'reset') {
              if (result && result.link && result.name) {
                nameTd.innerHTML = `<a href="${result.link}" target="_blank" rel="noopener noreferrer">${result.name}</a> (Reset successful)`;
                actionsTd.innerHTML = ''; // Clear confirm/cancel
                actionsTd.appendChild(deleteButton); // Only delete remains as an option now
              } else { // Reset failed
                alert(`Reset failed for ${course.name}. Please try again.`);
                restoreOriginalButtons();
              }
            } else if (actionType === 'delete') {
              if (result === true) { // `result` is boolean for delete
                nameTd.textContent = 'Deleted';
                tr.style.opacity = '0.5'; // Visually indicate deletion
                actionsTd.innerHTML = '<em>Deleted</em>'; // No more actions for this course
                setTimeout(() => { // Delay to ensure DOM updates before counting
                  if (getRemainingCoursesCount() === 0) {
                    handleAllSandboxesDeleted();
                  }
                }, 300);
              } else { // Delete failed
                alert(`Delete failed for ${course.name}. Please try again.`);
                restoreOriginalButtons();
              }
            }
            setAllPageActionButtonsDisabled(false); // Re-enable buttons
          });
        };

        cancelBtn.onclick = restoreOriginalButtons;

        actionsTd.appendChild(confirmBtn);
        actionsTd.appendChild(cancelBtn);
      }

      /** Restores the original Reset and Delete buttons to the action cell. */
      function restoreOriginalButtons() {
        actionsTd.innerHTML = '';
        actionsTd.appendChild(resetButton);
        actionsTd.appendChild(deleteButton);
      }

      resetButton.onclick = () => showActionConfirmation('reset');
      deleteButton.onclick = () => showActionConfirmation('delete');

      actionsTd.appendChild(resetButton);
      actionsTd.appendChild(deleteButton);
    });
    messageDiv.appendChild(table);

  } else {
    messageDiv.innerHTML = `<p>No active Sandbox courses found for your account.</p>
                            <p>You can go back to create a new Sandbox course or choose a different course type.</p>`;
  }
  // No 'processContainer.appendChild(messageDiv);' needed here as messageDiv is already appended.

  const prevButton = document.createElement('button');
  prevButton.className = 'buttonmain previous sandbox-nav-btn';
  prevButton.textContent = 'Back to Sandbox Setup';
  prevButton.title = 'Return to the Sandbox course agreement page.';
  prevButton.onclick = handleSandboxSelection;

  const courseSelectButton = document.createElement('button');
  courseSelectButton.className = 'buttonmain next sandbox-nav-btn'; // 'next' for layout, though action is 'back'
  courseSelectButton.textContent = 'Back to Course Type Selection';
  courseSelectButton.title = 'Return to the main course type selection screen.';
  courseSelectButton.onclick = displayTypeOptions;

  const buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(prevButton);
  if (Array.isArray(sbCourses) && sbCourses.length > 0) { // Only show "Course Selection" if there were courses to manage
      buttonRow.appendChild(courseSelectButton);
  } else { // If no courses, "Course Selection" might be redundant if "Back to Sandbox Setup" leads to creation.
      // Depending on flow, one might want to always show courseSelectButton or conditionally like this.
      // For now, let's assume if no courses, "Back to Sandbox Setup" is the primary path.
  }
  processContainer.appendChild(buttonRow);

  /**
   * Disables/enables all relevant action buttons on this page.
   * @param {boolean} disabled - True to disable, false to enable.
   */
  function setAllPageActionButtonsDisabled(disabled) {
    processContainer.querySelectorAll('.sandbox-reset-btn, .sandbox-delete-btn, .sandbox-confirm-btn, .sandbox-cancel-btn, .sandbox-nav-btn').forEach(btn => {
      // Pass existing classes to avoid them being overwritten by default add/remove in setButtonState
      const existingClasses = Array.from(btn.classList).join(' ');
      setButtonState(btn, btn.textContent, {
          isDisabled: disabled,
          isLoading: disabled, // Show loading visual on the button being processed
          addClass: existingClasses, // Preserve existing relevant classes
      });
    });
  }
}

/**
 * Performs a specified action (reset or delete) on a sandbox course via an API call.
 * This is primarily used by the management table in `handleSandboxExistsPage`.
 * @param {string} courseID - The Canvas ID of the course.
 * @param {string} accessToken - The user's OAuth access token.
 * @param {'reset' | 'delete'} task - The action to perform.
 * @param {string} userID - The user's Canvas ID (numeric).
 * @param {string} userLoginId - The user's login ID (e.g., eID).
 * @param {function} callback - Function to call with the result.
 *                              For 'reset': `callback({name: string, link: string} | null)`
 *                              For 'delete': `callback(boolean)`
 */
function performSandboxActionTableRow(courseID, accessToken, task, userID, userLoginId, callback) {
  fetch('https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ // Using URLSearchParams for robust encoding
      action: 'SBActions',
      task: task,
      courseID: courseID,
      accessToken: accessToken,
      userID: userID,
      userLoginId: userLoginId
    }).toString()
  })
  .then(response => {
    if (!response.ok) throw new Error(`API Action '${task}' failed: ${response.statusText}`);
    return response.json();
  })
  .then(data => {
    if (task === 'reset') {
      if (data && data.id && data.name && data.link) {
        callback({ name: data.name, link: data.link });
      } else {
        console.error(`Reset action failed for course ${courseID}:`, data.error || 'Unknown server error.');
        callback(null); // Indicate failure
      }
    } else if (task === 'delete') {
      if (data && data.delete === true) {
        callback(true); // Indicate success
      } else {
        console.error(`Delete action failed for course ${courseID}:`, data.error || 'Server did not confirm deletion.');
        callback(false); // Indicate failure
      }
    }
  })
  .catch(error => {
    console.error(`API request failed for ${task} on course ${courseID}:`, error);
    alert(`Operation ${task} failed for course ${courseID}. ${error.message}. Please try again.`);
    callback(task === 'reset' ? null : false); // Consistent failure indication
  });
}

// Unused function: showDeleteConfirmation (and its dependent showResetResult)
// Unused function: showResetConfirmation

/**
 * Handles the UI and logic for Training course creation.
 * Displays guidelines and requires user agreement via text input before proceeding.
 */
function handleTrainingSelection() {
  const processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  const header = document.createElement('h2');
  header.textContent = 'Training Course Shell Creation';
  processContainer.appendChild(header);

  const instructions = document.createElement('div');
  instructions.innerHTML = `
    <h3>Please Read the Following Guidelines and Restrictions</h3>
    <ul>
      <li>Training course shells are intended for training and instructional purposes (e.g., departmental training, software tutorials).</li>
      <li>They are <strong>not</strong> for official academic courses with student enrollments for credit.</li>
      <li>Enrollment automation may be possible; contact VCU Learning Systems for details.</li>
      <li>Training courses are typically restricted to internal VCU users.</li>
      <li>These shells are <strong>not</strong> for long-term document storage. Consult VCU data policies.</li>
      <li>Naming convention: "Training - [Your Chosen Name]".</li>
    </ul>`;
  processContainer.appendChild(instructions);

  const agreeDiv = document.createElement('div');
  agreeDiv.style.marginTop = '1em';
  const agreeLabel = document.createElement('label');
  agreeLabel.textContent = 'Type "I agree" to continue: ';
  agreeLabel.setAttribute('for', 'training-agree-input'); // Unique ID for this context
  agreeDiv.appendChild(agreeLabel);
  const agreeInput = document.createElement('input');
  agreeInput.type = 'text';
  agreeInput.id = 'training-agree-input';
  agreeInput.placeholder = 'I agree';
  agreeInput.autocomplete = 'off';
  agreeInput.className = 'textinput';
  agreeDiv.appendChild(agreeInput);
  processContainer.appendChild(agreeDiv);

  const previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.textContent = 'Previous';
  previousButton.onclick = () => {
    sessionStorage.removeItem('selectedOption');
    displayTypeOptions();
  };

  const nextButton = document.createElement('button');
  nextButton.className = 'buttonmain next';
  setButtonState(nextButton, 'Next', { isDisabled: true });
  nextButton.onclick = courseConfig; // Proceeds to course naming/configuration

  agreeInput.addEventListener('input', () => {
    const agreed = agreeInput.value.trim().toLowerCase() === 'i agree';
    setButtonState(nextButton, 'Next', { isDisabled: !agreed });
  });

  const buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(previousButton);
  buttonRow.appendChild(nextButton);
  processContainer.appendChild(buttonRow);
}

/**
 * Handles the UI and logic for Primary Course Template creation.
 * Displays guidelines and requires user agreement via text input before proceeding.
 */
function handlePrimarySelection() {
  const processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  const header = document.createElement('h2');
  header.textContent = 'Primary Course Template Creation';
  processContainer.appendChild(header);

  const instructions = document.createElement('div');
  instructions.innerHTML = `
    <h3>Please Read the Following Guidelines and Restrictions</h3>
    <ul>
      <li>Primary Course Templates are for continuous development of course materials (master copies).</li>
      <li>They are <strong>not</strong> intended for student enrollment or direct instruction.</li>
      <li>These templates will <strong>not</strong> be listed in Canvas Catalog.</li>
      <li>Naming convention will be: "Primary - [SUBJ] - [CourseNum] - [Your Course Name/Description] - [eID] - [MM/YY]".</li>
    </ul>`;
  processContainer.appendChild(instructions);

  const agreeDiv = document.createElement('div');
  agreeDiv.style.marginTop = '1em';
  const agreeLabel = document.createElement('label');
  agreeLabel.textContent = 'Type "I agree" to continue: ';
  agreeLabel.setAttribute('for', 'primary-agree-input'); // Unique ID
  agreeDiv.appendChild(agreeLabel);
  const agreeInput = document.createElement('input');
  agreeInput.type = 'text';
  agreeInput.id = 'primary-agree-input';
  agreeInput.placeholder = 'I agree';
  agreeInput.autocomplete = 'off';
  agreeInput.className = 'textinput';
  agreeDiv.appendChild(agreeInput);
  processContainer.appendChild(agreeDiv);

  const previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.textContent = 'Previous';
  previousButton.onclick = () => {
    sessionStorage.removeItem('selectedOption');
    displayTypeOptions();
  };

  const nextButton = document.createElement('button');
  nextButton.className = 'buttonmain next';
  setButtonState(nextButton, 'Next', { isDisabled: true });
  nextButton.onclick = courseConfig;

  agreeInput.addEventListener('input', () => {
    const agreed = agreeInput.value.trim().toLowerCase() === 'i agree';
    setButtonState(nextButton, 'Next', { isDisabled: !agreed });
  });

  const buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(previousButton);
  buttonRow.appendChild(nextButton);
  processContainer.appendChild(buttonRow);
}

/**
 * Handles the UI for Canvas Catalog course shell creation.
 * NOTE: This section is a placeholder and not fully implemented.
 */
function handleCatalogSelection() {
  const processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  const header = document.createElement('h2');
  header.textContent = 'Canvas Catalog Course Shell Creation (Placeholder)';
  processContainer.appendChild(header);

  const instructions = document.createElement('div');
  instructions.innerHTML = `
    <h3>Guidelines and Restrictions (Example)</h3>
    <ul>
      <li>This section is for creating courses intended for Canvas Catalog.</li>
      <li>Ensure you have approval and understand Catalog requirements before proceeding.</li>
      <li><strong>Note:</strong> Full functionality for Catalog course creation is not yet implemented in this tool.</li>
    </ul>`;
  processContainer.appendChild(instructions);

  const previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.textContent = 'Previous';
  previousButton.onclick = () => {
    sessionStorage.removeItem('selectedOption');
    displayTypeOptions();
  };

  const nextButton = document.createElement('button');
  nextButton.className = 'buttonmain next';
  setButtonState(nextButton, 'Next (Not Implemented)', { isDisabled: true });
  nextButton.onclick = () => {
    alert('Canvas Catalog course creation is not yet implemented.');
  };

  const buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(previousButton);
  buttonRow.appendChild(nextButton);
  processContainer.appendChild(buttonRow);
}

/**
 * Displays the course configuration screen (name, subject, number) based on the selected course type.
 * Provides a live preview of the generated course name.
 */
function courseConfig() {
  const processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  const selectedType = sessionStorage.getItem('selectedOption') || 'Unknown';

  const header = document.createElement('h2');
  header.textContent = 'Configure Your Course Details';
  processContainer.appendChild(header);

  const typeP = document.createElement('p');
  typeP.innerHTML = `<strong>Course Type Selected:</strong> ${selectedType}`;
  processContainer.appendChild(typeP);

  const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
  // Use a placeholder if loginID is somehow unavailable, though it should be from Canvas profile
  const loginID = userInfo.userProfile?.login_id || 'USER_EID';

  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const mmYY = `${mm}/${yy}`;

  let nameInput, subjInput, numInput, previewDiv;
  // Use a DocumentFragment for performance when adding multiple elements
  const formFragment = document.createDocumentFragment();

  /**
   * Helper to create a label and an input field, appending them to the formFragment.
   * @param {string} id - Base for input ID and label's 'for' attribute.
   * @param {string} labelText - Text for the label.
   * @param {string} placeholder - Placeholder for the input.
   * @param {number} [maxLength] - Optional maxLength for the input.
   * @param {string} [pattern] - Optional regex pattern for input validation.
   * @param {string} [title] - Optional title attribute for input validation message.
   * @returns {HTMLInputElement} The created input element.
   */
  function createFormField(id, labelText, placeholder, maxLength, pattern, title) {
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.textContent = labelText;
    label.style.display = 'block'; // Basic styling
    label.style.marginTop = '0.5em';

    const input = document.createElement('input');
    input.type = 'text'; // Default to text
    input.id = id;
    input.className = 'textinput';
    input.placeholder = placeholder;
    input.autocomplete = 'off';
    if (maxLength) input.maxLength = maxLength;
    if (pattern) input.pattern = pattern;
    if (title) input.title = title; // For validation messages
    input.style.display = 'block';
    input.style.marginBottom = '1em';

    formFragment.appendChild(label);
    formFragment.appendChild(input);
    return input;
  }

  // Input fields vary by course type
  if (selectedType === 'Primary') {
    subjInput = createFormField('subject-input', 'Subject (e.g., BIOL - 4 letters max):', 'SUBJ', 4, "[A-Za-z]{1,4}", "Enter 1-4 letters for the subject code.");
    numInput = createFormField('course-num-input', 'Course Number (e.g., 101 - 3 alphanumeric chars max):', '###', 3, "[A-Za-z0-9]{1,3}", "Enter 1-3 letters/numbers for the course number.");
    nameInput = createFormField('course-name-input-primary', 'Descriptive Course Name (e.g., Introduction to Biology):', 'Full Course Name');
  } else { // Sandbox, Training, or other generic types
    nameInput = createFormField('course-name-input-generic', 'Give your course a name:', 'Course Name');
  }

  processContainer.appendChild(formFragment); // Add all created form fields to the DOM at once

  previewDiv = document.createElement('div');
  previewDiv.id = 'course-name-preview';
  previewDiv.style.margin = '0.5em 0 1em 0';
  previewDiv.style.fontStyle = 'italic';
  previewDiv.style.fontWeight = 'bold';
  previewDiv.style.color = '#333';
  processContainer.appendChild(previewDiv);

  /** Updates the course name preview text based on current input values. */
  function updateCourseNamePreview() {
    let previewText = "Preview: ";
    const courseNamePart = nameInput.value.trim();

    if (selectedType === 'Primary') {
      const subj = subjInput.value.trim().toUpperCase();
      const num = numInput.value.trim().toUpperCase();
      // Example: "Primary - BIOL - 101 - Intro to Bio - jdoe - 03/24"
      previewText += `Primary - ${subj || '[SUBJ]'} - ${num || '[###]'} - ${courseNamePart || '[Desc. Name]'} - ${loginID} - ${mmYY}`;
    } else if (selectedType === 'Training') {
      // Training courses use the exact name entered by the user, no prefix.
      previewText += courseNamePart || '[Your Chosen Course Name]';
    } else { // Sandbox and any other types (e.g., a future 'General' type)
      const prefix = selectedType === 'Sandbox' ? 'Sandbox - ' : `${selectedType} - `;
      previewText += courseNamePart ? `${prefix}${courseNamePart}` : `${prefix}[Course Name]`;
    }
    previewDiv.textContent = previewText;
  }

  // Attach event listeners for live preview and input validation
  [nameInput, subjInput, numInput].forEach(input => {
    if (input) { // subjInput and numInput might be null for non-Primary types
      input.addEventListener('input', () => {
        // Apply specific formatting/validation rules if needed during input
        if (input === subjInput) input.value = input.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
        if (input === numInput) input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);

        updateCourseNamePreview();
        checkFormValidityForNextButton(); // Update Next button state based on validity
      });
    }
  });
  updateCourseNamePreview(); // Call once for initial preview

  const previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.textContent = 'Previous';
  previousButton.onclick = () => {
    const prevOption = sessionStorage.getItem('selectedOption');
    // Navigate back to the agreement page for the current type, or type selection if no specific agreement page
    if (prevOption === 'Sandbox') handleSandboxSelection();
    else if (prevOption === 'Training') handleTrainingSelection();
    else if (prevOption === 'Primary') handlePrimarySelection();
    else if (prevOption === 'Catalog') handleCatalogSelection();
    else displayTypeOptions(); // Fallback
  };

  const nextButton = document.createElement('button');
  nextButton.className = 'buttonmain next';
  setButtonState(nextButton, 'Next', { isDisabled: true }); // Initially disabled

  /** Checks if all required fields for the current course type are filled to enable/disable Next button. */
  function checkFormValidityForNextButton() {
    let isValid = false;
    if (selectedType === 'Primary') {
      isValid = subjInput.value.trim().length > 0 && subjInput.checkValidity() &&
                  numInput.value.trim().length > 0 && numInput.checkValidity() &&
                  nameInput.value.trim().length > 0;
    } else { // Sandbox, Training
      isValid = nameInput.value.trim().length > 0;
    }
    setButtonState(nextButton, 'Next', { isDisabled: !isValid });
  }
  checkFormValidityForNextButton(); // Initial check

  nextButton.onclick = () => {
    const finalCourseName = previewDiv.textContent.replace('Preview: ', '').trim();
    // Basic check for placeholders still being in the generated name
    if (finalCourseName.includes('[') || finalCourseName.includes(']')) {
        alert('Please ensure all parts of the course name are filled in correctly.');
        return;
    }
    showConfirmationPage(finalCourseName); // Pass the generated name
  };

  const buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(previousButton);
  buttonRow.appendChild(nextButton);
  processContainer.appendChild(buttonRow);
}


/**
 * Displays a confirmation page summarizing the course details before final submission.
 * The final course name is passed directly to this function from `courseConfig`.
 * @param {string} finalCourseName - The fully constructed and validated course name.
 */
function showConfirmationPage(finalCourseName) {
  const processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  const accessToken = sessionStorage.getItem('accessToken') || '';
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
  const courseType = sessionStorage.getItem('selectedOption') || 'Unknown'; // Fallback
  const instructorID = userInfo.userProfile?.id || '';
  const loginID = userInfo.userProfile?.login_id || '';

  // Critical check: ensure necessary info is present before proceeding
  if (!accessToken || !instructorID || !loginID || courseType === 'Unknown') {
    alert('Critical session information is missing. Please log out and try again.');
    console.error('Missing session data for confirmation:', {accessToken, instructorID, loginID, courseType});
    logout(); // Attempt to reset state by logging out
    return;
  }

  const payload = {
    action: 'createCourse',
    type: courseType,
    accessToken: accessToken,
    course_name: finalCourseName, // Use the fully constructed name passed as argument
    instructorID: instructorID,
    instructorLoginID: loginID
  };

  const header = document.createElement('h2');
  header.textContent = 'Confirm Your Course Creation Request';
  processContainer.appendChild(header);

  const summaryDiv = document.createElement('div');
  summaryDiv.innerHTML = `
    <p>Please review the details of the course you are about to create:</p>
    <p><strong>Course Type:</strong> ${payload.type}</p>
    <p><strong>Final Course Name:</strong> ${payload.course_name}</p>
    <p style="margin-top:1em;">If this information is correct, click "Submit Request". Otherwise, click "Previous" to make changes.</p>`;
  processContainer.appendChild(summaryDiv);

  // Use URLSearchParams for robust payload string construction
  const payloadString = new URLSearchParams(payload).toString();

  const previousButton = document.createElement('button');
  previousButton.className = 'buttonmain previous';
  previousButton.textContent = 'Previous';
  previousButton.onclick = courseConfig; // Go back to course config page

  const submitButton = document.createElement('button');
  submitButton.className = 'buttonmain next'; // Using 'next' for styling consistency as primary action
  setButtonState(submitButton, 'Submit Request', { isDisabled: false });

  submitButton.onclick = function () {
    setButtonState(this, 'Submitting...', { isLoading: true, isDisabled: true });
    submitCourseRequest(payloadString);
  };

  const buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(previousButton);
  buttonRow.appendChild(submitButton);
  processContainer.appendChild(buttonRow);
}

/**
 * Submits the course creation request to the Google Apps Script API.
 * Handles the API response, displaying success or error messages.
 * @param {string} payloadString - The URL-encoded string of parameters for the API request.
 */
function submitCourseRequest(payloadString) {
  const processContainer = document.getElementById('process-container');
  processContainer.innerHTML = ''; // Clear previous content (confirmation details)

  const loadingP = document.createElement('p');
  loadingP.textContent = 'Submitting your request... This may take a moment.';
  processContainer.appendChild(loadingP);

  const apiUrl = 'https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec';

  fetch(apiUrl, {
    redirect: 'follow',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: payloadString,
  })
  .then(response => {
    if (!response.ok) { // Check for non-2xx responses
      return response.json().catch(() => { // Try to parse error details from GAS
        // If response isn't JSON or parsing fails, create a generic error
        throw new Error(`Server error: ${response.status} ${response.statusText}. Please try again or contact support.`);
      }).then(errData => { // If JSON error structure is available from GAS
        throw new Error(errData.error || `Server error: ${response.status} ${response.statusText}.`);
      });
    }
    return response.json(); // For successful responses
  })
  .then(data => {
    processContainer.innerHTML = ''; // Clear loading message
    if (data.error) { // GAS returned a JSON with an 'error' field
      processContainer.innerHTML = `<h2>Error Creating Course</h2><p>${data.error}</p>`;
    } else if (data.id && data.name && data.link) { // Expected success structure
      processContainer.innerHTML = `<h2>Course Created Successfully!</h2>
                                   <p><strong>Name:</strong> ${data.name}</p>
                                   <p><strong>ID:</strong> ${data.id}</p>
                                   <p><a href="${data.link}" target="_blank" rel="noopener noreferrer">View Your New Course in Canvas</a></p>`;
    } else { // Unexpected success response structure
      processContainer.innerHTML = `<h2>Unexpected Response</h2>
                                   <p>The course may have been created, but the server's response was not in the expected format. Please check Canvas or contact support.</p>
                                   <details><summary>Server Response Details (for support)</summary><pre style="white-space: pre-wrap; word-break: break-all;">${JSON.stringify(data, null, 2)}</pre></details>`;
      console.error('Unexpected server response after course creation attempt:', data);
    }

    // Always add a "Start Over" button after completion (success or handled error)
    const startOverButton = document.createElement('button');
    startOverButton.textContent = 'Create Another Course / Start Over';
    startOverButton.className = 'buttonmain';
    startOverButton.style.marginTop = '20px';
    startOverButton.onclick = displayTypeOptions;
    processContainer.appendChild(startOverButton);

  })
  .catch(error => { // Catch network errors or errors thrown from .then()
    processContainer.innerHTML = ''; // Clear loading message
    console.error('Fatal error submitting course request:', error);
    processContainer.innerHTML = `<h2>Request Failed</h2>
                                 <p>A critical error occurred: ${error.message}</p>
                                 <p>Please try again. If the issue persists, note the error and contact support.</p>`;
    const retryButton = document.createElement('button');
    retryButton.textContent = 'Try Again / Start Over';
    retryButton.className = 'buttonmain';
    retryButton.style.marginTop = '20px';
    // Navigating back to displayTypeOptions is a safe reset.
    // For a true "retry" of the same submission, payloadString would need to be available here.
    retryButton.onclick = displayTypeOptions;
    processContainer.appendChild(retryButton);
  });
}

/**
 * Updates the state of the logout button (enabled/disabled) based on `apiCallsInProgress`.
 * Called by the patched `fetch` before and after API requests.
 */
function updateLogoutButtonState() {
  const logoutButton = document.querySelector('.buttonmain.logout');
  if (logoutButton) {
    const disableLogout = apiCallsInProgress > 0;
    // isLoading is generally false for the logout button itself, as it's not the primary action causing waiting.
    // It's just disabled to prevent interrupting an ongoing API call.
    setButtonState(logoutButton, 'Logout', {
        isLoading: false, // The logout button itself isn't "loading" something
        isDisabled: disableLogout,
        addClass: 'logout', // Ensure 'logout' class is present
        removeClass: disableLogout ? '' : 'loading' // Clean up 'loading' if it was ever added and no longer needed
    });
  }
}


/**
 * Handles user logout.
 * Calls the Google Apps Script logout endpoint, clears session storage, and resets the UI to the login state.
 */
function logout() {
  const logoutButton = document.querySelector('.buttonmain.logout');
  // Disable the button immediately on click, even before fetch starts its own disabling.
  if (logoutButton) {
    setButtonState(logoutButton, 'Logging Out...', { isLoading: true, isDisabled: true, addClass: 'logout' });
  }

  const accessToken = sessionStorage.getItem('accessToken');

  fetch('https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec', {
    redirect: 'follow',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ // Use URLSearchParams for cleaner body construction
        action: 'logout',
        accessToken: accessToken || '' // Send token if available, GAS might handle empty token gracefully
    }).toString()
  })
  .then(response => response.text()) // GAS logout often returns plain text confirmation
  .then(message => {
    const successMessage = message.toLowerCase().includes('logout successful');
    if (!successMessage) {
        // Log non-standard success messages from server, but proceed with client-side logout for UX.
        console.warn('Server logout message indicates potential issue or non-standard response:', message);
    }

    sessionStorage.clear(); // Clear session data on the client side.

    const contentDiv = document.getElementById('content');
    if (contentDiv) {
      // Reset UI to its initial pre-authorization state.
      contentDiv.innerHTML = `
        <h1>VCU Canvas Non-Academic Course Creation Tool</h1>
        <div class="user-info" id="user-info" style="display:none;">
             <p>Name: <span id="user-name"></span></p>
             <span class="pipe">|</span>
             <p>Email: <span id="user-email"></span></p>
        </div>
        <div id="error-message-container" style="display:none; color: red; padding-bottom: 10px; font-size: medium; font-weight: bold;"></div>
        <div class="processcontainer" id="process-container" style="display:none;"></div>
        <p>${successMessage ? 'Logout successful.' : 'Logout processed.'} You can close this window or log in again.</p>
        <button id="authorize-btn" class="buttonmain authorize" onclick="authorize()" style="display:inline-block;">Authorize Canvas Login</button>
        <button class="buttonmain logout" onclick="logout()" style="display:none;">Logout</button> <!-- This button instance is new, ensure it's hidden -->
        `;

      // Manually ensure elements from authenticated state are correctly hidden/shown,
      // mimicking the logic in DOMContentLoaded event listener for a fresh page state.
      // The innerHTML replacement above should mostly handle this, but explicit ensures can be added if needed.
      // For example, if any elements were outside #content but managed by JS:
      // document.getElementById('user-info').style.display = 'none';
      // document.getElementById('process-container').style.display = 'none';
      // const currentLogoutBtn = document.querySelector('.buttonmain.logout'); // The one outside #content if it exists
      // if (currentLogoutBtn) currentLogoutBtn.style.display = 'none';
      // const authBtn = document.getElementById('authorize-btn'); // The one outside #content
      // if (authBtn) authBtn.style.display = 'inline-block';

    } else {
      console.error('Main content div (ID: content) not found post-logout. Reloading page as fallback.');
      window.location.reload();
    }
  })
  .catch(error => {
    console.error('Error during logout API call:', error);
    alert(`An error occurred during logout: ${error.message}. Your session data on this page has been cleared, but please ensure you are logged out of Canvas if issues persist.`);
    sessionStorage.clear(); // Attempt to clear session even on critical error.
    window.location.reload(); // Force a reload to reset state.
  })
  .finally(() => {
    // The global patched fetch's .finally block will call updateLogoutButtonState.
    // If the logout button was removed from DOM (expected on successful logout), this is fine.
    // If an error occurred and the button might still be there, updateLogoutButtonState will
    // attempt to re-enable it if apiCallsInProgress is 0.
    // The UI reconstruction in .then() should handle the button's final state correctly.
  });
}