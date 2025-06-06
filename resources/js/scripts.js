function authorize() {
  var authorizeButton = document.getElementById('authorize-btn');

  if (!authorizeButton) {
    console.error('Authorize button not found');
    return;
  }

  // Disable the button and change its appearance using the class
  authorizeButton.classList.add('loading', 'blue');
  authorizeButton.disabled = true;
  authorizeButton.textContent = 'Launching Canvas for Login';

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
      authorizeButton.classList.remove('loading', 'blue');
      authorizeButton.disabled = false;
      authorizeButton.textContent = 'Authorize Canvas Login';
    });
}

function displayTypeOptions() {
  // Disable the 'Next' button while loading
  var nextButton = document.querySelector('.buttonmain');
  nextButton.classList.add('loading', 'blue');
  nextButton.innerHTML = 'Loading';
  nextButton.disabled = true;

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
    console.log(`Button clicked: ${option}`);
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
  nextButton.classList.remove('loading', 'blue');
  nextButton.innerHTML = 'Next';
  nextButton.disabled = false;
}

function courseConfigSelection(selectedOption) {
  // Disable the 'Next' button while loading
  var nextButton = document.querySelector('.buttonmain');
  nextButton.classList.add('loading', 'blue');
  nextButton.innerHTML = 'Loading';
  nextButton.disabled = true;

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
      nextButton.classList.remove('loading', 'blue');
      nextButton.innerHTML = 'Next';
      nextButton.disabled = false;
      return;
  }
}

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
  nextButton.innerHTML = 'Next';
  nextButton.disabled = true; // Disabled by default
  nextButton.style.cursor = 'not-allowed';
  nextButton.style.opacity = '0.5';

  // Enable Next button only if input is "I agree" (case-insensitive)
  agreeInput.addEventListener('input', function () {
    if (agreeInput.value.trim().toLowerCase() === 'i agree') {
      nextButton.disabled = false;
      nextButton.style.cursor = 'pointer';
      nextButton.style.opacity = '1';
    } else {
      nextButton.disabled = true;
      nextButton.style.cursor = 'not-allowed';
      nextButton.style.opacity = '0.5';
    }
  });

  // Create the button row container and append buttons
  var buttonRow = document.createElement('div');
  buttonRow.className = 'button-row';
  buttonRow.appendChild(previousButton);
  buttonRow.appendChild(nextButton);

  // Append the button row to the process container
  processContainer.appendChild(buttonRow);

  // --- SBCheck API Call ---
  var accessToken = sessionStorage.getItem('accessToken');
  fetch('https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'action=SBCheck&accessToken=' + encodeURIComponent(accessToken)
  })
    .then(response => response.json())
    .then(data => {
      // Next button logic based on SBCheck response
      nextButton.onclick = function () {
        if (agreeInput.value.trim().toLowerCase() !== 'i agree') return;
        if (data.sb === false) {
          courseConfig();
        } else if (data.sb === true) {
          handleSandboxExistsPage(data.sbCourses); // Pass the array of courses
        }
      };
    })
    .catch(error => {
      console.error('Error checking for existing Sandbox course:', error);
      // Optionally, show an error message to the user
      nextButton.disabled = true;
      nextButton.style.cursor = 'not-allowed';
      nextButton.style.opacity = '0.5';
    });
}

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
    var accessToken = sessionStorage.getItem('accessToken');

    // Add Reset and Delete buttons
    var resetButton = document.createElement('button');
    resetButton.className = 'buttonmain';
    resetButton.innerHTML = 'Reset Sandbox Course';
    resetButton.disabled = !courseID;
    resetButton.onclick = function () {
      if (!courseID) return;
      // Show confirmation dialog before resetting
      showResetConfirmation(courseID, accessToken, sbCourses[0].name);
    };

    var deleteButton = document.createElement('button');
    deleteButton.className = 'buttonmain';
    deleteButton.innerHTML = 'Delete Sandbox Course';
    deleteButton.disabled = !courseID;
    deleteButton.onclick = function () {
      if (!courseID) return;
      deleteButton.disabled = true;
      deleteButton.innerHTML = 'Deleting...';
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
        });
    };

    var cancelButton = document.createElement('button');
    cancelButton.className = 'buttonmain previous';
    cancelButton.innerHTML = 'Cancel';
    cancelButton.onclick = handleSandboxSelection;

    var buttonRow = document.createElement('div');
    buttonRow.className = 'button-row';
    buttonRow.appendChild(resetButton);
    buttonRow.appendChild(deleteButton);
    buttonRow.appendChild(cancelButton);

    processContainer.appendChild(buttonRow);
}

// Helper function for reset confirmation and reset logic
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
    confirmButton.innerHTML = 'Yes, Reset Course';
    confirmButton.onclick = function () {
      confirmButton.disabled = true;
      confirmButton.innerHTML = 'Resetting...';
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
        });
    };

    var backButton = document.createElement('button');
    backButton.className = 'buttonmain previous';
    backButton.innerHTML = 'Go Back';
    backButton.onclick = function () {
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
    buttonRow.appendChild(backButton);

    processContainer.appendChild(buttonRow);
}

// Show the result after reset (same as after showConfirmationPage submit)
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
  nextButton.innerHTML = 'Next';
  nextButton.disabled = true; // Disabled by default
  nextButton.style.cursor = 'not-allowed';
  nextButton.style.opacity = '0.5';
  nextButton.onclick = courseConfig;

  // Enable Next button only if input is "I agree" (case-insensitive)
  agreeInput.addEventListener('input', function () {
    if (agreeInput.value.trim().toLowerCase() === 'i agree') {
      nextButton.disabled = false;
      nextButton.style.cursor = 'pointer';
      nextButton.style.opacity = '1';
    } else {
      nextButton.disabled = true;
      nextButton.style.cursor = 'not-allowed';
      nextButton.style.opacity = '0.5';
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
  nextButton.innerHTML = 'Next';
  nextButton.disabled = true; // Disabled by default
  nextButton.style.cursor = 'not-allowed';
  nextButton.style.opacity = '0.5';
  nextButton.onclick = courseConfig;

  // Enable Next button only if input is "I agree" (case-insensitive)
  agreeInput.addEventListener('input', function () {
    if (agreeInput.value.trim().toLowerCase() === 'i agree') {
      nextButton.disabled = false;
      nextButton.style.cursor = 'pointer';
      nextButton.style.opacity = '1';
    } else {
      nextButton.disabled = true;
      nextButton.style.cursor = 'not-allowed';
      nextButton.style.opacity = '0.5';
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
    console.log('Next button clicked for Canvas Catalog Course Shell');
    // You can also redirect to another function or page if needed
  };

  processContainer.appendChild(previousButton);
  processContainer.appendChild(nextButton);
}

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
  var mmYY = mm + '/' + yy;



  // Variables for input elements
  var nameInput, subjInput, numInput, previewDiv;

  switch (selectedType) {
    case 'Primary':
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

    // Update preview function
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
    updatePrimaryPreview();

    break;

    case 'Sandbox':
      // Label for course name (used in all cases)
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
      updateSandboxPreview();

      break;

    default:
        // Label for course name (used in all cases)
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
    var selectedType = sessionStorage.getItem('selectedOption');
    switch (selectedType) {
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
        displayTypeOptions();
        break;
    }
  };

  // Next button
  var nextButton = document.createElement('button');
  nextButton.className = 'buttonmain next';
  nextButton.innerHTML = 'Next';
  nextButton.disabled = true;
  nextButton.style.opacity = '0.5';

  // Enable Next button only if required fields are filled
  if (selectedType === 'Primary') {
    function checkPrimaryFields() {
      if (
        subjInput.value.trim().length > 0 &&
        numInput.value.trim().length > 0 &&
        nameInput.value.trim().length > 0
      ) {
        nextButton.disabled = false;
        nextButton.style.opacity = '1';
      } else {
        nextButton.disabled = true;
        nextButton.style.opacity = '0.5';
      }
    }
    subjInput.addEventListener('input', checkPrimaryFields);
    numInput.addEventListener('input', checkPrimaryFields);
    nameInput.addEventListener('input', checkPrimaryFields);
    checkPrimaryFields();

    nextButton.onclick = function () {
      var subj = subjInput.value.trim().toUpperCase();
      var num = numInput.value.trim();
      var courseName = nameInput.value.trim();
      // Pass the full preview string to confirmation
      var fullName = `Primary - ${subj} - ${num} - ${courseName} - ${loginID} - ${mmYY}`;
      showConfirmationPage(fullName);
    };
  } else {
    nameInput.addEventListener('input', function () {
      if (nameInput.value.trim().length > 0) {
        nextButton.disabled = false;
        nextButton.style.opacity = '1';
      } else {
        nextButton.disabled = true;
        nextButton.style.opacity = '0.5';
      }
    });
    nextButton.onclick = function () {
      var courseName = nameInput.value.trim();
      showConfirmationPage(courseName);
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

function showConfirmationPage(courseName) {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  // Get apiToken and userInfo from sessionStorage
  var accessToken = sessionStorage.getItem('accessToken') || '';
  var userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
  var courseType = sessionStorage.getItem('selectedOption') || '';
  var instructorID = userInfo.userProfile && userInfo.userProfile.id ? userInfo.userProfile.id : '';
  var loginID = userInfo.userProfile && userInfo.userProfile.login_id ? userInfo.userProfile.login_id : '';
  var courseName = courseName || '';

  // Build the payload
  var payload = {
    action: 'createCourse',
    type: courseType,
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
submitButton.innerHTML = 'Submit';
submitButton.onclick = function () {
  submitCourseRequest(payloadString);
  console.log('Submitting course request:', payloadString);
};

// Create the button row container and append buttons
var buttonRow = document.createElement('div');
buttonRow.className = 'button-row';
buttonRow.appendChild(previousButton);
buttonRow.appendChild(submitButton);

// Append the button row to the process container
processContainer.appendChild(buttonRow);
}

function submitCourseRequest(payloadString) {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  // Show loading
  var loading = document.createElement('p');
  loading.textContent = 'Submitting your request...';
  processContainer.appendChild(loading);

  // Define the URL for your API endpoint
  var apiUrl ='https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec';

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
    if (data.error) {
      processContainer.innerHTML = '<h2>Error Creating Course</h2><p>' + data.error + '</p>';
    } else if (data.id && data.name && data.link) { // Assuming these fields indicate success
      processContainer.innerHTML = '<h2>Course Created Successfully!</h2><p>Name: ' + data.name + '</p><p>ID: ' + data.id + '</p><p><a href="' + data.link + '" target="_blank">View Course</a></p>';
    } else {
      // Handle unexpected response structure
      processContainer.innerHTML = '<h2>Unexpected Response</h2><p>The server responded in an unexpected way. Please check the logs.</p>';
      console.error('Unexpected server response:', data);
    }
  })
  .catch(error => {
    console.error('Error submitting course request:', error);
    processContainer.innerHTML = '<h2>Request Failed</h2><p>An error occurred while submitting your request: ' + error.message + '</p>';
  });
}

function logout() {
  // Disable the 'Logout' button while loading
  var logoutButton = document.querySelector('.buttonmain.logout');
  logoutButton.classList.add('loading', 'logout');
  logoutButton.innerHTML = 'Logging Out';
  logoutButton.disabled = true;

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
      logoutButton.classList.remove('loading', 'logout');
      logoutButton.classList.add('buttonmain', 'logout');
      logoutButton.innerHTML = 'Logout';
      logoutButton.disabled = false;
    });
}