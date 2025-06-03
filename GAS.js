function doPost(e) {

  // Check if the request contains the accessToken and action parameters
  if (e.parameter.accessToken && e.parameter.action) {
    console.log('Received doPost request:', e);
    Logger.log('Received doPost request:', e);

    switch (e.parameter.action) {

      case 'login':
        var authorizationUrl = getAuthorizationUrl();
        return ContentService.createTextOutput(JSON.stringify({ authorizationUrl: authorizationUrl })).setMimeType(ContentService.MimeType.JSON);

      case 'exchangeCode':
        if (e.parameter.code) {
          var accessToken = getAccessToken(e.parameter.code);
          return ContentService.createTextOutput(JSON.stringify(accessToken)).setMimeType(ContentService.MimeType.JSON);
        } else {
          return ContentService.createTextOutput(JSON.stringify({ error: "No authorization code provided." })).setMimeType(ContentService.MimeType.JSON);
        }

      case 'getUserInfo':
        return ContentService.createTextOutput(JSON.stringify(getUserProfile(e.parameter.accessToken))).setMimeType(ContentService.MimeType.JSON);

      case 'terms':

        return ContentService.createTextOutput(JSON.stringify(getTerms(e.parameter.accessToken))).setMimeType(ContentService.MimeType.JSON);

      case 'getEnrollments':
        return ContentService.createTextOutput(JSON.stringify(getCourses(e.parameter.accessToken, e.parameter.enrollmentTermId))).setMimeType(ContentService.MimeType.JSON);

      case 'createCourse':
        return ContentService.createTextOutput(JSON.stringify(courseCreateWorkflow(e.parameter))).setMimeType(ContentService.MimeType.JSON);

      case 'logout':
        return handleLogoutRequest(e.parameter.accessToken);

      default:
        return ContentService.createTextOutput('Invalid action').setMimeType(ContentService.MimeType.TEXT);
    }
  } else {
    return ContentService.createTextOutput('Invalid request').setMimeType(ContentService.MimeType.TEXT);
  }
}

function getAuthorizationUrl() {
  var domain = PropertiesService.getScriptProperties().getProperty('domain_instance');
  var client_id = PropertiesService.getScriptProperties().getProperty('oauth_client_id');
  var redirect_uri = PropertiesService.getScriptProperties().getProperty('redirect_uri');

  var authorizationUrl = domain + '/login/oauth2/auth?';
  authorizationUrl += 'response_type=code';
  authorizationUrl += '&client_id=' + client_id;
  authorizationUrl += '&redirect_uri=' + redirect_uri;
  //authorizationUrl += '&scope=';
  //authorizationUrl += 'url:GET|/api/v1/users/:user_id/profile';
  //authorizationUrl += '%20url:GET|/api/v1/users/:user_id/enrollments';
  //authorizationUrl += '%20url:POST|/api/v1/sections/:id/crosslist/:new_course_id';
  //authorizationUrl += '%20url:GET|/api/v1/courses/:id';
  //authorizationUrl += '&scope=' + 'url:GET|/api/v1/users/:user_id/profile' + '%20' + 'url:GET|/api/v1/users/:user_id/enrollments' + '%20' + 'url:POST|/api/v1/sections/:id/crosslist/:new_course_id' + '%20' + 'url:GET|/api/v1/courses/:id';

  return authorizationUrl;
}

function getAccessToken(code) {
  var domain = PropertiesService.getScriptProperties().getProperty('domain_instance');
  var client_id = PropertiesService.getScriptProperties().getProperty('oauth_client_id');
  var client_sec = PropertiesService.getScriptProperties().getProperty('oauth_client_secret');
  var redirect_uri = PropertiesService.getScriptProperties().getProperty('redirect_uri');
  var tokenUrl = domain + '/login/oauth2/token';
  var homeURL = PropertiesService.getScriptProperties().getProperty('home_uri');

  var payload = {
    'grant_type': 'authorization_code',
    'code': code,
    'client_id': client_id,
    'client_secret': client_sec,
    'redirect_uri': redirect_uri
  };

  var options = {
    'method': 'POST',
    'payload': payload
  };

  var response = UrlFetchApp.fetch(tokenUrl, options);
  var tokenData = JSON.parse(response.getContentText());

  console.log('Token Exchange Request:', options);
  console.log('Token Exchange Response:', response.getContentText());

  // Use the tokenData to make authenticated requests to Canvas API
  var access_token = tokenData.access_token;
  // Save access_token for future use

  // Construct the response object
  var responseData = {
    accessToken: access_token,
    homeUrl: homeURL
  };

  return responseData;
}

function getUserProfile(accessToken) {
  var domain = PropertiesService.getScriptProperties().getProperty('domain_instance');
  var apiUrl = domain + '/api/v1/users/self/profile';

  var options = {
    'method': 'get',
    'headers': {
      'Authorization': 'Bearer ' + accessToken
    }
  };

  try {
    // Fetch user profile
    var response = UrlFetchApp.fetch(apiUrl, options);
    var userData = JSON.parse(response.getContentText());

    // Check for TeacherEnrollments
    var enrollmentCheck = checkTeacherEnrollments(accessToken);

    // If no TeacherEnrollments are found, return a message
    if (!enrollmentCheck.success) {
      return {
        success: false,
        message: enrollmentCheck.message,
        userProfile: userData
      };
    }

    // If TeacherEnrollments are found, return the user profile and success message
    return {
      success: true,
      message: 'Teacher enrollments found. Proceeding with login.',
      userProfile: userData
    };
  } catch (error) {
    // Handle errors
    console.error('Error fetching user profile or checking enrollments:', error);
    return {
      success: false,
      message: 'An error occurred while fetching the user profile or checking enrollments.',
      error: error.toString()
    };
  }
}

// Check if the user has any TeacherEnrollments
function checkTeacherEnrollments(accessToken) {
  var domain = PropertiesService.getScriptProperties().getProperty('domain_instance');
  var enrollmentAPI = domain + '/api/v1/users/self/enrollments?per_page=100&type=TeacherEnrollment';

  var options = {
    'method': 'get',
    'headers': {
      'Authorization': 'Bearer ' + encodeURIComponent(accessToken)
    }
  };

  try {
    // Fetch enrollments
    var response = UrlFetchApp.fetch(enrollmentAPI, options);
    var responseData = JSON.parse(response.getContentText());

    // Check if any TeacherEnrollments exist
    if (responseData && responseData.length > 0) {
      // Proceed with authorizing the login
      return { success: true, message: 'Teacher enrollments found. Proceeding with login.' };
    } else {
      // No TeacherEnrollments found
      return { success: false, message: 'No TeacherEnrollments found. You cannot proceed with login.' };
    }
  } catch (error) {
    // Handle error appropriately
    console.error('Error checking TeacherEnrollments:', error);
    return { success: false, message: 'An error occurred while checking TeacherEnrollments.' };
  }
}

// Fetch Terms
function getTerms(accessToken) {
  var domain = PropertiesService.getScriptProperties().getProperty('domain_instance');
  var termsAPI = domain + '/api/v1/accounts/1/terms?per_page=100';
  var termstoken = PropertiesService.getScriptProperties().getProperty('elevated_token');

  var options = {
    'method': 'get',
    'headers': {
      'Authorization': 'Bearer ' + termstoken
    }
  };

  try {
    var response = UrlFetchApp.fetch(termsAPI, options);
    var responseData = JSON.parse(response.getContentText());

    // Process the response and extract only the needed information for current and future terms
    var now = new Date(); // Current date and time

    var enrollmentTerms = responseData.enrollment_terms.filter(function (term) {
      var startAt = new Date(term.start_at);
      var endAt = new Date(term.end_at);

      // Include terms that have a start date in the future or end date in the future
      return startAt >= now || endAt >= now;
    }).map(function (term) {
      return {
        id: term.id,
        name: term.name
      };
    });

    return enrollmentTerms;
  } catch (error) {
    // Handle error appropriately (logging, returning an error response, etc.)
    console.error('Error fetching enrollment terms:', error);
    return { error: 'Error fetching enrollment terms' };
  }
}

// Fetch Courses
function getCourses(accessToken, enrollmentTermId) {
  var domain = PropertiesService.getScriptProperties().getProperty('domain_instance');
  var enrollmentAPI = domain + '/api/v1/users/self/enrollments?per_page=100&type=TeacherEnrollment&enrollment_term_id=' + encodeURIComponent(enrollmentTermId);
  var coursesAPI = domain + '/api/v1/courses/'; // Canvas API endpoint for courses

  var options = {
    'method': 'get',
    'headers': {
      'Authorization': 'Bearer ' + encodeURIComponent(accessToken)
    }
  };

  try {
    var response = UrlFetchApp.fetch(enrollmentAPI, options);
    var responseData = JSON.parse(response.getContentText());

    // Array to store course details
    var courses = [];

    // Iterate through each enrollment and fetch course details
    responseData.forEach(function (enrollment) {
      // Fetch additional course details using the course_id
      var courseDetailsAPI = coursesAPI + enrollment.course_id;
      var courseDetailsResponse = UrlFetchApp.fetch(courseDetailsAPI, options);
      var courseDetails = JSON.parse(courseDetailsResponse.getContentText());

      // Filter out courses with sisCourseId starting with "CL-"
      if (!courseDetails.sis_course_id || !courseDetails.sis_course_id.startsWith('CL-')) {
        // Extract relevant information
        var course = {
          courseId: enrollment.course_id,
          courseSectionId: enrollment.course_section_id,
          courseName: courseDetails.name,
          courseCode: courseDetails.course_code,
          sisCourseId: courseDetails.sis_course_id,
          accountId: courseDetails.account_id,
          termId: courseDetails.enrollment_term_id
          // Add more fields as needed
        };

        // Push course details to the array
        courses.push(course);
      }
    });

    // Log or return the courses array as needed
    Logger.log(courses);
    return courses;
  } catch (error) {
    // Handle error appropriately
    Logger.log('Error:', error);
    return null;
  }
}

// Create New Course - Enroll Teacher
function courseCreateWorkflow(parameter) {
  var domain = PropertiesService.getScriptProperties().getProperty('domain_instance');
  var elevatedToken = PropertiesService.getScriptProperties().getProperty('elevated_token');
  // Extract parameters from the request
  var payload = parameter;
  var courseName = payload.course_name;
  var courseCode = courseName;
  var enrollmentTermId = '1'; // Default term ID, replace with actual term ID if needed";
  var userID = payload.instructorID;
  var userLoginId = payload.instructorLoginID;
  var accessToken = payload.accessToken;
  var courseSections = payload.course_sections.split(',');
  var sisid;
  var accountId;
  switch (payload.type) {
    case 'Sandbox':
      sisid = 'SB-' + ('0000' + Math.floor(Math.random() * 10000)).slice(-4) + Math.floor(new Date().getTime() / 1000) + '-' + userLoginId;
      accountId = PropertiesService.getScriptProperties().getProperty('sandbox_sub_account_id');
      break;
    case 'Training':
      sisid = 'TR-' + ('0000' + Math.floor(Math.random() * 10000)).slice(-4) + Math.floor(new Date().getTime() / 1000);
      accountId = PropertiesService.getScriptProperties().getProperty('training_sub_account_id');
      break;
    case 'Primary':
      sisid = 'PR-' + courseName + '-' + enrollmentTermId;
      break;
    case 'Catalog':
      sisid = 'CL-' + courseName + '-' + enrollmentTermId;
      break;
    default:
      sisid = '';
      break;
  }

  // Step 1: Create a new course
  var createCourseUrl = domain + '/api/v1/accounts/' + accountId + '/courses';
  var createCourseParams = {
    course: {
      name: courseName,
      course_code: courseCode,
      term_id: enrollmentTermId,
      sis_course_id: sisid
    }
  };
  var createCourseOptions = {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + elevatedToken,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(createCourseParams)
  };

  var newCourseResponse = UrlFetchApp.fetch(createCourseUrl, createCourseOptions);
  var newCourseData = JSON.parse(newCourseResponse.getContentText());
  var newCourseId = newCourseData.id;
  var newCourseName = newCourseData.name;
  var newCourseLink = domain + "/courses/" + newCourseId;
  var createEnrollmentOptions = createCourseOptions;

  // Step 2: Enroll the teacher into the new course
  // Implement this step based on your enrollment logic

  var enrollUrl = domain + '/api/v1/courses/'
    + newCourseId
    + "/enrollments?enrollment[user_id]="
    + userID
    + "&"
    + "enrollment[role_id]=4&enrollment[notify]=true&enrollment[enrollment_state]=active";

  var response = UrlFetchApp.fetch(enrollUrl, createEnrollmentOptions);


  // Step 4: Return the new course details
  var newCourse = {
    link: newCourseLink,
    id: newCourseId,
    name: newCourseName
  };

  logVariablesToSheet(sisid, courseName, courseCode, enrollmentTermId, accountId, userID, courseSections, newCourseLink);

  return newCourse;
}

function logVariablesToSheet(sisid, courseName, courseCode, enrollmentTermId, accountId, userID, courseSections, newCourseLink) {
  var sheetId = "1cjGsdZnuvnLbB8egJiNKz3wX6Na2MEU74Ss_m1zjW48"; // Replace with the ID of your Google Sheet
  var sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
  var utcTimestamp = Date.now(); // Get the current UTC timestamp in milliseconds
  var humanReadableDate = new Date(utcTimestamp).toUTCString(); // Convert the timestamp to a human-readable date string

  // Append the variables to the sheet
  sheet.appendRow([humanReadableDate, sisid, courseName, courseCode, enrollmentTermId, accountId, userID, courseSections.join(', '), newCourseLink]);
}

//Delete Token and Logout
function handleLogoutRequest(accessToken) {
  var domain = PropertiesService.getScriptProperties().getProperty('domain_instance');
  var revokeUrl = domain + '/login/oauth2/token';

  var options = {
    'method': 'delete',
    'headers': {
      'Authorization': 'Bearer ' + encodeURIComponent(accessToken)
    }
  };

  try {
    // Make the DELETE request
    var response = UrlFetchApp.fetch(revokeUrl, options);

    // Check the status code and send the appropriate response
    if (response.getResponseCode() === 200) {
      // Additional cleanup logic if needed

      // Send a success response
      return ContentService.createTextOutput('Logout successful').setMimeType(ContentService.MimeType.TEXT);
    } else {
      // Send an error response
      return ContentService.createTextOutput('Logout failed').setMimeType(ContentService.MimeType.TEXT);
    }
  } catch (error) {
    // Log any error that occurred during the DELETE request
    console.error('Logout Error:', error);

    // Send an error response
    return ContentService.createTextOutput('Logout failed').setMimeType(ContentService.MimeType.TEXT);
  }
}