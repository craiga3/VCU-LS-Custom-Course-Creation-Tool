// Declare termSelectionMessageDisplayed outside of the terms function
var termSelectionMessageDisplayed = false;

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
      text: 'Master Course Copy Shell',
      title: 'Create a master course copy shell for template purposes',
      onClick: () => handleButtonClick('Master'),
    },
    {
      text: 'Canvas Catalog Course Shell',
      title: 'Create a Canvas Catalog course shell for public-facing courses',
      onClick: () => handleButtonClick('Catalog'),
    },
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

  // Reset the flag when 'Next' button is clicked
  termSelectionMessageDisplayed = false;

  // Retrieve access token from sessionStorage
  var accessToken = sessionStorage.getItem('accessToken');

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
    case 'Master':
      handleMasterSelection();
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
  header.textContent = 'Sandbox Course Shell Selected';
  processContainer.appendChild(header);

  var instructions = document.createElement('div');
  instructions.innerHTML = '<p><!-- Add Sandbox instructions or HTML here --></p>';
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
    // Add logic for next step here
  };

  processContainer.appendChild(previousButton);
  processContainer.appendChild(nextButton);
}

function handleTrainingSelection() {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  var header = document.createElement('h2');
  header.textContent = 'Training Course Shell Selected';
  processContainer.appendChild(header);

  var instructions = document.createElement('div');
  instructions.innerHTML = '<p><!-- Add Training instructions or HTML here --></p>';
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
    // Add logic for next step here
  };

  processContainer.appendChild(previousButton);
  processContainer.appendChild(nextButton);
}

function handleMasterSelection() {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  var header = document.createElement('h2');
  header.textContent = 'Master Course Copy Shell Selected';
  processContainer.appendChild(header);

  var instructions = document.createElement('div');
  instructions.innerHTML = '<p><!-- Add Master instructions or HTML here --></p>';
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
    // Add logic for next step here
  };

  processContainer.appendChild(previousButton);
  processContainer.appendChild(nextButton);
}

function handleCatalogSelection() {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  var header = document.createElement('h2');
  header.textContent = 'Canvas Catalog Course Shell Selected';
  processContainer.appendChild(header);

  var instructions = document.createElement('div');
  instructions.innerHTML = '<p><!-- Add Catalog instructions or HTML here --></p>';
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
    // Add logic for next step here
  };

  processContainer.appendChild(previousButton);
  processContainer.appendChild(nextButton);
}

function terms() {
  // Disable the 'Next' button while loading
  var nextButton = document.querySelector('.buttonmain');
  nextButton.classList.add('loading', 'blue');
  nextButton.innerHTML = 'Loading';
  nextButton.disabled = true;

  // Reset the flag when 'Next' button is clicked
  termSelectionMessageDisplayed = false;

  // Retrieve access token from sessionStorage
  var accessToken = sessionStorage.getItem('accessToken');

  // Send a request to the Google Apps Script endpoint for enrollment terms
  fetch(
    'https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec',
    {
      redirect: 'follow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'action=terms' + '&accessToken=' + encodeURIComponent(accessToken),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      // Handle the returned data (enrollment terms) here
      // Update HTML with the received data
      displayTerms(data);
    })
    .catch((error) => {
      console.error('Error fetching enrollment terms:', error);
      // Handle error appropriately

      // Re-enable the 'Next' button if there's an error
      resetNextButton();
    });
}

function displayTerms(terms) {
  // Get the container element to replace its content
  var processContainer = document.getElementById('process-container');

  // Clear existing content
  while (processContainer.firstChild) {
    processContainer.removeChild(processContainer.firstChild);
  }

  // Add a header for the "Select Term" section
  var header = document.createElement('h2');
  header.textContent = 'Select Term';
  processContainer.appendChild(header);

  // Instructions for Selecting Term
  var instructions = document.createElement('p');
  instructions.innerHTML = "Please select the term for the courses you'd like to merge.<br>The more courses you are assigned, the longer the next step will take to load.";
  processContainer.appendChild(instructions);

  // Create a form element to hold the radio buttons
  var form = document.createElement('form');

  // Iterate through the terms and create a radio button for each
  terms.forEach((term) => {
    var label = document.createElement('label');
    label.innerHTML =
      '<input type="radio" name="term" value="' + term.id + '"> ' + term.name;
    form.appendChild(label);
    form.appendChild(document.createElement('br'));
  });

  // Create a button to proceed to the next step
  var nextButton = document.createElement('button');
  nextButton.className = 'buttonmain';
  nextButton.innerHTML = 'Next';
  nextButton.onclick = function () {

    // Get the selected term ID
    var selectedTermId;
    var radioButtons = form.elements['term'];

    if (radioButtons.length) {
        // If there are multiple radio buttons (more than one option)
        for (var i = 0; i < radioButtons.length; i++) {
            if (radioButtons[i].checked) {
                selectedTermId = radioButtons[i].value;
                break;
            }
        }
    } else if (radioButtons.checked) {
        // If there's only one radio button (one option)
        selectedTermId = radioButtons.value;
    }


    // Clear the message if it was displayed before
    var selectionMessage = processContainer.querySelector('.reminder.selection');
    if (selectionMessage) {
      processContainer.removeChild(selectionMessage);
    }

    if (!selectedTermId) {
      // Display a message in the div
      var selectionMessage = document.createElement('p');
      selectionMessage.classList.add('reminder', 'selection');
      selectionMessage.innerHTML =
        'Please make a selection before continuing.';
      processContainer.appendChild(selectionMessage);

      // Set the flag to true so that the message is not displayed again
      termSelectionMessageDisplayed = true;

      // Re-enable the 'Next' button
      resetNextButton();
      return;
    }

    // Reset the flag when 'Next' button is clicked
    termSelectionMessageDisplayed = false;

    // Trigger the getEnrollments action with the selected term ID
    getEnrollments(selectedTermId);
  };

  // Add the form and next button to the process container
  processContainer.appendChild(form);
  processContainer.appendChild(nextButton);
}

// Assume resetNextButton function resets the 'Next' button state
function resetNextButton() {
  var nextButton = document.querySelector('.buttonmain');
  nextButton.classList.remove('loading', 'blue');
  nextButton.innerHTML = 'Next';
  nextButton.disabled = false;
}

function getEnrollments(enrollmentTermId) {
  // Disable the 'Next' button while loading
  var nextButton = document.querySelector('.buttonmain');
  nextButton.classList.add('loading', 'blue');
  nextButton.innerHTML = 'Loading';
  nextButton.disabled = true;

  // Retrieve access token from sessionStorage
  var accessToken = sessionStorage.getItem('accessToken');

  // Send a request to the Google Apps Script endpoint for getEnrollments
  fetch(
    'https://script.google.com/macros/s/AKfycbxqkbPY18f_CpXY2MRmr2Ou7SVQl5c7HQjnCbaoX0V2621sdC_4N-tPQgeggU0l-QDrFQ/exec',
    {
      redirect: 'follow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body:
        'action=getEnrollments' +
        '&accessToken=' +
        encodeURIComponent(accessToken) +
        '&enrollmentTermId=' +
        encodeURIComponent(enrollmentTermId),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      // Handle the returned data (enrollments) here
      // Update HTML
      displayCourses(data, enrollmentTermId); // Pass enrollmentTermId to displayCourses
    })
    .catch((error) => {
      console.error('Error fetching enrollments:', error);
      // Handle error appropriately

      // Re-enable the 'Next' button if there's an error
      nextButton.classList.remove('loading', 'blue');
      nextButton.innerHTML = 'Next';
      nextButton.disabled = false;
    });
}

function displayCourses(courses, enrollmentTermId) {
    // Sort the courses alphanumerically by courseName
    courses.sort((a, b) => {
      const nameA = a.courseName.toLowerCase();
      const nameB = b.courseName.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  // Get the container element to replace its content
  var processContainer = document.getElementById('process-container');

  // Clear existing content
  processContainer.innerHTML = '';

  // Add a header for the "Select Courses" section
  var header = document.createElement('h2');
  header.textContent = 'Select Courses';
  processContainer.appendChild(header);

  // Check if there are no courses
  if (courses.length === 0) {
    var noCoursesMessage = document.createElement('p');
    noCoursesMessage.className = 'reminder selection'; // Use the .reminder.selection class
    noCoursesMessage.innerHTML =
      'No Teacher assignments found for the selected term.';
    processContainer.appendChild(noCoursesMessage);

    // Create a button for previous step
    var previousButton = document.createElement('button');
    previousButton.className = 'buttonmain';
    previousButton.innerHTML = 'Previous';
    previousButton.onclick = function () {
      // Call the function for previous step
      terms();
    };
    // Add previous button to the process container
    processContainer.appendChild(previousButton);

    return;
  }

  // Add instructions for selecting courses
  var instructions = document.createElement('p');
  instructions.textContent =
    'Please select at least two courses you want to merge.';
  processContainer.appendChild(instructions);

  // Create a form element to hold the checkboxes
  var form = document.createElement('form');

  // Create a grid to display courses with checkboxes
  var gridContainer = document.createElement('div');
  gridContainer.className = 'grid-container';

  // Declare an array to store selected courses
  var selectedCourses = [];

  // Iterate through the courses and create a checkbox for each
  courses.forEach((course) => {
    var checkboxLabel = document.createElement('label');
    checkboxLabel.innerHTML = `
<input type="checkbox" name="course" value='${JSON.stringify(
      course
    )}'>
<span>${course.courseName} | SIS ID: ${course.sisCourseId
      }</span>
`;
    gridContainer.appendChild(checkboxLabel);

    // Add an event listener to the checkbox
    checkboxLabel
      .querySelector('input')
      .addEventListener('change', function () {
        // Update the selectedCourses array based on checkbox changes
        if (this.checked) {
          selectedCourses.push(course);
        } else {
          // Remove the course from the array if unchecked
          selectedCourses = selectedCourses.filter(
            (selectedCourse) => selectedCourse !== course
          );
        }
      });
  });

  // Create a button for previous step
  var previousButton = document.createElement('button');
  previousButton.className = 'buttonmain';
  previousButton.style.cssFloat = 'left'; // Align to the left
  previousButton.innerHTML = 'Previous';
  previousButton.onclick = function () {
    // Call the function for previous step
    terms();
  };

  // Create a button to proceed to the next step
  var nextButton = document.createElement('button');
  nextButton.className = 'buttonmain'; // Use the .buttonmain class
  nextButton.style.cssFloat = 'right'; // Align to the right
  nextButton.innerHTML = 'Next';
  nextButton.onclick = function () {
    // Clear existing selection messages
    clearSelectionMessages();

    // Check the number of selected courses
    if (selectedCourses.length < 2) {
      // Display a message if less than 2 courses are selected
      var selectionMessage = document.createElement('p');
      selectionMessage.className = 'reminder selection';
      selectionMessage.innerHTML =
        'Please select at least two courses before continuing.';

      // Add the new message
      processContainer.appendChild(selectionMessage);
    } else {
      // Proceed to the next step and pass the selected courses
      displayParentCourseDetails(selectedCourses, enrollmentTermId);
    }
  };

  // Add the grid and next button to the process container
  form.appendChild(gridContainer);
  processContainer.appendChild(form);
  processContainer.appendChild(previousButton);
  processContainer.appendChild(nextButton);
}

// Function to clear existing selection messages
function clearSelectionMessages() {
  var existingMessages = document.querySelectorAll('.reminder.selection');
  existingMessages.forEach((message) => message.remove());
}

function displayParentCourseDetails(selectedCourses, enrollmentTermId) {
  // Sort the courses alphanumerically by courseName
  selectedCourses.sort((a, b) => {
    const nameA = a.courseName.toLowerCase();
    const nameB = b.courseName.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  // Get the container element to replace its content
  var processContainer = document.getElementById('process-container');

  // Clear existing content
  processContainer.innerHTML = '';

  // Add a header for the "Parent Course Details" section
  var header = document.createElement('h2');
  header.textContent = 'Parent Course Details';
  processContainer.appendChild(header);

  // Add instructions for giving the parent course a name
  var nameLabel = document.createElement('p');
  nameLabel.textContent = 'Please give the parent course a name:';
  processContainer.appendChild(nameLabel);

  // Create a stylized text box for the parent course name
  var nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'textinput'; // Add a class for styling
  processContainer.appendChild(nameInput);

  // Add instructions for the list of selected courses
  var coursesLabel = document.createElement('p');
  coursesLabel.textContent =
    'These selected courses will be merged into the parent course:';
  processContainer.appendChild(coursesLabel);

  // Create a list to display the selected courses
  var coursesList = document.createElement('ul');
  coursesList.className = 'selected-courses-list';

  // Iterate through the selected courses and create list items
  selectedCourses.forEach((course) => {
    var listItem = document.createElement('li');
    listItem.textContent = `${course.courseName} | SIS ID: ${course.sisCourseId}`;
    coursesList.appendChild(listItem);
  });

  // Add the list of selected courses to the process container
  processContainer.appendChild(coursesList);

  // Create a button for previous step
  var previousButton = document.createElement('button');
  previousButton.className = 'buttonmain';
  previousButton.style.cssFloat = 'left'; // Align to the left
  previousButton.innerHTML = 'Previous';
  previousButton.onclick = function () {
    // Call the function for previous step with enrollmentTermId
    getEnrollments(enrollmentTermId); // Pass enrollmentTermId back
  };

  // Create a button to proceed to the next step
  var nextButton = document.createElement('button');
  nextButton.className = 'buttonmain'; 
  nextButton.style.cssFloat = 'right'; 
  nextButton.onclick = function () {
    // Check if the parent course name input is empty
    var parentCourseName = nameInput.value.trim();
    if (parentCourseName === '') {
      // Clear existing selection messages
      clearSelectionMessages();

      // Display a message under the next button
      var selectionMessage = document.createElement('p');
      selectionMessage.className = 'reminder selection';
      selectionMessage.textContent =
        'Please give the parent course a name.';
      processContainer.appendChild(selectionMessage);
      return; // Stop the function from proceeding further
    }

    // If there's a value, clear any existing warning message
    clearSelectionMessages();

    // Proceed to the next step with the provided parent course name and selected courses
    displayConfirmationScreen(parentCourseName, selectedCourses, enrollmentTermId);
  };

  // Add the next button to the process container
  processContainer.appendChild(previousButton);
  processContainer.appendChild(nextButton);
}

// Function to clear existing selection messages
function clearSelectionMessages() {
  var existingMessages = document.querySelectorAll('.reminder.selection');
  existingMessages.forEach((message) => message.remove());
}

function displayConfirmationScreen(
  parentCourseName,
  selectedCourses,
  enrollmentTermId
) {
  var processContainer = document.getElementById('process-container');
  processContainer.innerHTML = '';

  var header = document.createElement('h2');
  header.textContent = 'Confirmation';
  processContainer.appendChild(header);

  var parentCourseLabel = document.createElement('p');
  parentCourseLabel.textContent = 'Parent Course Name: ' + parentCourseName;
  processContainer.appendChild(parentCourseLabel);

  var coursesLabel = document.createElement('p');
  coursesLabel.textContent = 'Selected Courses:';
  processContainer.appendChild(coursesLabel);

  var coursesList = document.createElement('ul');
  selectedCourses.forEach((course) => {
    var listItem = document.createElement('li');
    listItem.textContent = `${course.courseName} | SIS ID: ${course.sisCourseId}`;
    coursesList.appendChild(listItem);
  });
  processContainer.appendChild(coursesList);

  // Create a button for previous step
  var previousButton = document.createElement('button');
  previousButton.className = 'buttonmain';
  previousButton.style.cssFloat = 'left'; // Align to the left
  previousButton.innerHTML = 'Previous';
  previousButton.onclick = function () {
    // Call the function for previous step with enrollmentTermId
    displayParentCourseDetails(selectedCourses, enrollmentTermId); // Pass enrollmentTermId back
  };

  var mergeButton = document.createElement('button');
  mergeButton.className = 'buttonmain merge green';
  mergeButton.style.cssFloat = 'right'; // Align to the right
  mergeButton.textContent = 'Merge';

  // Disable the merge button and change its class to reflect loading state on click
  mergeButton.onclick = function () {
    mergeButton.disabled = true;
    mergeButton.classList.add('loading', 'merge');
    mergeButton.textContent = 'Merging';

    // Call the mergeCourses function to initiate the merge process
    mergeCourses(parentCourseName, selectedCourses);
  };
  processContainer.appendChild(previousButton);
  processContainer.appendChild(mergeButton);
}

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