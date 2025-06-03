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
    <li>Sandbox courses will not be listed in the Canvas Catalog.</li>
    <li>Sandbox courses are not subject to the same restrictions as other course types.</li>
    <li>Sandbox courses can be used to test new features, plugins, and integrations.</li>
    <li>Sandbox courses will follow a specific naming convention: "Sandbox - [Course Name]".</li>
    <li>Sandbox courses are limited to a maximum of 1 per user.</li>
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
    // For example, you might want to call a function to create the sandbox course shell
    console.log('Next button clicked for Sandbox Course Shell');
    // You can also redirect to another function or page if needed

  };

  processContainer.appendChild(previousButton);
  processContainer.appendChild(nextButton);
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
  nextButton.disabled = true; // Disabled by default
  nextButton.style.cursor = 'not-allowed'; // Change cursor to indicate disabled state
  nextButton.style.opacity = '0.5'; // Grayed out by default
  nextButton.onclick = courseConfig; // Call courseConfig function when "Next" is clicked

  // Enable Next button only if input is "I agree" (case-insensitive)
  agreeInput.addEventListener('input', function () {
    if (agreeInput.value.trim().toLowerCase() === 'i agree') {
      nextButton.disabled = false;
      nextButton.style.cursor = 'pointer'; // Enables clickable state
      nextButton.style.opacity = '1';
    } else {
      nextButton.disabled = true;
      nextButton.style.cursor = 'not-allowed'; // Change cursor to indicate disabled state
      nextButton.style.opacity = '0.5';
    }
  });

  processContainer.appendChild(previousButton);
  processContainer.appendChild(nextButton);
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

// Assume resetNextButton function resets the 'Next' button state
function resetNextButton() {
  var nextButton = document.querySelector('.buttonmain');
  nextButton.classList.remove('loading', 'blue');
  nextButton.innerHTML = 'Next';
  nextButton.disabled = false;
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

  // Label for course name
  var nameLabel = document.createElement('label');
  nameLabel.setAttribute('for', 'course-name-input');
  nameLabel.textContent = 'Give your course a name:';
  processContainer.appendChild(nameLabel);

  // Textbox for course name
  var nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'course-name-input';
  nameInput.className = 'textinput';
  nameInput.placeholder = 'Course Name';
  nameInput.autocomplete = 'off';
  nameInput.style.display = 'block';
  nameInput.style.marginBottom = '1em';
  processContainer.appendChild(nameInput);

  // Preview area for the generated course name
  var previewDiv = document.createElement('div');
  previewDiv.style.margin = '0.5em 0 1em 0';
  previewDiv.style.fontStyle = 'italic';
  previewDiv.style.color = '#000';
  processContainer.appendChild(previewDiv);

  // Function to update the preview based on selectedType and input
  function updatePreview() {
    var courseName = nameInput.value.trim();
    let previewText = '';
    switch (selectedType) {
      case 'Sandbox':
        previewText = courseName ? `Sandbox - ${courseName}` : 'Sandbox - [Course Name]';
        break;
      case 'Training':
        previewText = courseName ? `${courseName}` : 'Course Name';
        break;
      case 'Primary':
        previewText = courseName ? `Primary Template: ${courseName}` : 'Primary Template: [Course Name]';
        break;
      case 'Catalog':
        previewText = courseName ? `Catalog Course: ${courseName}` : 'Catalog Course: [Course Name]';
        break;
      default:
        previewText = courseName ? courseName : '[Course Name]';
    }
    previewDiv.textContent = `Preview: ${previewText}`;
  }

  // Initial preview
  updatePreview();

  // Update preview and next button state on input
  nameInput.addEventListener('input', function () {
    updatePreview();
    if (nameInput.value.trim().length > 0) {
      nextButton.disabled = false;
      nextButton.style.opacity = '1';
    } else {
      nextButton.disabled = true;
      nextButton.style.opacity = '0.5';
    }
  });

  // Previous button
  var previousButton = document.createElement('button');
  previousButton.className = 'buttonmain';
  previousButton.innerHTML = 'Previous';
  previousButton.onclick = function () {
    // Go back to the previous step
    handleTrainingSelection(); // Or call the appropriate function for your flow
  };

  // Next button
  var nextButton = document.createElement('button');
  nextButton.className = 'buttonmain';
  nextButton.innerHTML = 'Next';
  nextButton.disabled = true;
  nextButton.style.opacity = '0.5';
  nextButton.onclick = function () {
  var courseName = nameInput.value.trim();
  showConfirmationPage(courseName);
};

  processContainer.appendChild(previousButton);
  processContainer.appendChild(nextButton);
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
    <p><strong>Course Name:</strong> ${payload.course_Name}</p>
  `;
  processContainer.appendChild(summary);

  var payloadString = Object.keys(payload)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]))
    .join('&');

  // Previous button
  var previousButton = document.createElement('button');
  previousButton.className = 'buttonmain';
  previousButton.innerHTML = 'Previous';
  previousButton.onclick = function () {
    courseConfig(); // Go back to course config page
  };

  // Submit button
  var submitButton = document.createElement('button');
  submitButton.className = 'buttonmain';
  submitButton.innerHTML = 'Submit';
  submitButton.onclick = function () {
    submitCourseRequest(payloadString);
    console.log('Submitting course request:', payload);
  };

  processContainer.appendChild(previousButton);
  processContainer.appendChild(submitButton);
}

// Example submit handler (replace with your actual API call logic)
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

// ---
// To call this confirmation page from courseConfig, add this to your courseConfig's Next button onclick:
// showConfirmationPage(selectedType, nameInput.value.trim());

function mergeCourses(parentCourseName, selectedCourses) {
  // Get the userInfo from session storage
  var userInfoString = sessionStorage.getItem('userInfo');

  // Parse the userInfoString to JSON
  var userInfoJson;
  try {
    userInfoJson = JSON.parse(userInfoString);
  } catch (error) {
    console.error('Error parsing userInfo:', error);
    return;
  }

  // Access the 'id' property directly
  if (userInfoJson && userInfoJson.id != null) {
    var userId = userInfoJson.id;

    // Get termId and accountId from the first item in selectedCourses
    var firstCourse = selectedCourses[0];
    var termId = firstCourse.termId;
    var accountId = firstCourse.accountId;

    // Construct the payload for the merge action
    var payload = {
      action: 'mergeSections',
      course_name: parentCourseName,
      course_sections: selectedCourses.map((course) => course.courseSectionId),
      inst_id: userId,
      accessToken: sessionStorage.getItem('accessToken'),
      enrollmentTermId: termId,
      accountId: accountId,
    };

    // Convert payload to URL-encoded string
    var payloadString = Object.keys(payload)
      .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]))
      .join('&');

    // Define the URL for your API endpoint
    var apiUrl =
      'https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec';

    // Make the POST request using fetch API
    fetch(apiUrl, {
      redirect: 'follow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payloadString,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Handle the response as JSON
      })
      .then((data) => {
        // Handle the response data here
        // Call displayMergeSuccess if merge was successful
        displayMergeSuccess(data);
      })
      .catch((error) => {
        console.error('Error:', error);
        // Re-enable the merge button and remove loading state
        mergeButton.disabled = false;
        mergeButton.classList.remove('loading', 'merge');
        mergeButton.textContent = 'Merge';
      });
  } else {
    console.error('User ID not found in userInfo');
  }
}


function displayMergeSuccess(responseFromServer) {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  // Create a button for previous step
  var startOverButton = document.createElement('button');
  startOverButton.className = 'buttonmain';
  //startOverButton.style.transform = 'translateX(50%)';
  startOverButton.innerHTML = 'Start Over';
  startOverButton.onclick = function () {
    // Call the function for previous step
    terms();
  };
  // Add previous button to the process container

  var header = document.createElement('h2');
  header.textContent = 'Merge Successful';
  processContainer.appendChild(header);

  var parentCourseLabel = document.createElement('p');
  parentCourseLabel.textContent =
    'Parent Course Name: ' + responseFromServer.name;
  processContainer.appendChild(parentCourseLabel);

  var link = document.createElement('a');
  link.href = responseFromServer.link;
  link.textContent = 'View New Course';
  link.target = '_blank'; // Open link in a new tab
  processContainer.appendChild(link);

  var successMessage = document.createElement('p');
  successMessage.textContent = 'Course successfully merged!';
  processContainer.appendChild(successMessage);
  processContainer.appendChild(startOverButton);
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