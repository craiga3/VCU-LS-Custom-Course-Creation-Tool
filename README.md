# VCU Canvas Non-Academic Course Creation Tool

This web application allows authorized VCU faculty and staff to create various types of non-academic course shells in Canvas, such as Sandbox courses, Training shells, and Primary Course Templates.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technical Stack](#technical-stack)
- [Project Structure](#project-structure)
- [Setup and Prerequisites](#setup-and-prerequisites)
- [Usage](#usage)
- [API Backend](#api-backend)
- [Error Handling](#error-handling)
- [Styling](#styling)
- [Support](#support)

## Overview

The tool provides a user-friendly interface to guide users through the process of selecting a course type, agreeing to relevant guidelines, providing necessary course information, and finally creating the course shell in VCU's Canvas instance. It aims to streamline the creation of non-academic shells while ensuring users are aware of policies and naming conventions.

## Features

-   **OAuth2 Authentication:** Securely logs users in via VCU Canvas.
-   **User Information Display:** Shows the logged-in user's name and email.
-   **Dynamic UI:** The interface changes based on user selections and progress.
-   **Course Type Selection:**
    -   Sandbox Course Shell
    -   Training Course Shell
    -   Primary Course Template Shell
-   **Guidelines and Agreement:** Users must agree to terms specific to each course type.
-   **Sandbox Course Management:**
    -   Checks for existing sandbox courses (limit 1 per user).
    -   Allows users to reset or delete existing sandbox courses.
-   **Dynamic Course Naming:** Provides previews of course names.
    -   Sandbox: `Sandbox - [User Input]`
    -   Training: `[User Input]` (no prefix/suffix)
    -   Primary: `Primary - [SUBJ] - [CourseNum] - [User Input Name] - [eID] - [MM/YY]`
-   **API Integration:** Communicates with a Google Apps Script backend to perform Canvas actions (login, course creation, sandbox checks/management). Includes abortable API calls for better UX.
-   **Error Display:** Shows user-friendly error messages for common issues (e.g., authorization failure, API errors).
-   **Logout Functionality:** Allows users to securely log out.

## Technical Stack

-   **Frontend:** HTML, CSS, JavaScript (Vanilla JS)
-   **Backend (API):** Google Apps Script (interfacing with Canvas API)
-   **Styling:** Plain CSS, with some elements from VCU branding.

## Project Structure

```
├── .gitattributes                  # Git attributes file
├── .gitignore                      # Git ignore file
├── GAS.js                          # Google Apps Script backend code
├── README.md                       # This file
├── USER_DOCUMENTATION.md           # User guide
├── index.html                      # Main application page
├── notes.md                        # Developer notes or scratchpad
├── redirect.html                   # Page to handle OAuth callback
├── resources/
│   ├── css/
│   │   ├── redirect.css            # Styles for redirect page
│   │   └── style.css               # Main stylesheet
│   ├── img/
│   │   ├── favicon.png             # Favicon
│   │   └── loading.png             # Loading indicator
│   └── js/
│       ├── redirect.js             # JavaScript for redirect page
│       └── scripts.js              # Main JavaScript logic
├── scopes.md                       # Required Canvas API OAuth scopes
└── ... (other configuration files if any)
```

## Setup and Prerequisites

This tool is designed to be hosted as a static web application, with the backend logic handled by a deployed Google Apps Script.

1.  **Google Apps Script Backend:**
    *   The core backend logic resides in a Google Apps Script project (similar to `GAS.js` in this repository).
    *   This script needs to be deployed as a web app with appropriate permissions to:
        *   Execute as the user accessing the web app.
        *   Access Google Drive/Sheets (if used for logging or configuration, though not apparent in current JS).
        *   Connect to external services (Canvas API).
    *   The deployed Google Apps Script URL is hardcoded in `resources/js/scripts.js`.
    *   The script handles OAuth2 with Canvas, makes Canvas API calls, and returns JSON responses.

2.  **Frontend Hosting:**
    *   The HTML, CSS, and JS files can be hosted on any static web hosting provider (e.g., VCU web servers, GitHub Pages if configured for organizational use).

3.  **Canvas API Configuration:**
    *   The Google Apps Script backend must be configured with Canvas API developer keys (client ID and secret) to facilitate OAuth2 and make API calls.
    *   The redirect URI for the Canvas OAuth app must point to the `redirect.html` page of this tool.

## Script Properties Configuration

The Google Apps Script (`GAS.js`) relies on several script properties to be configured for it to function correctly. These properties are set in the Google Apps Script editor under "Project Settings" > "Script Properties".

*   `domain_instance`: The base URL of your Canvas instance (e.g., `https://canvas.vcu.edu`). Used to construct API endpoint URLs.
*   `oauth_client_id`: The Client ID obtained from Canvas when setting up Developer Keys for OAuth2.
*   `redirect_uri`: The URI where users are redirected after authorizing the application in Canvas. This should point to your deployed `redirect.html`.
*   `oauth_client_secret`: The Client Secret obtained from Canvas when setting up Developer Keys for OAuth2.
*   `home_uri`: The URL of the main application page (`index.html`) where users are redirected after successful token exchange.
*   `elevated_token`: A Canvas API access token with elevated privileges, required for certain administrative actions like creating courses in specific sub-accounts. This token should be generated from a user account that has the necessary permissions.
*   `sandbox_sub_account_id`: The Canvas Account ID for the sub-account where Sandbox courses will be created.
*   `training_sub_account_id`: The Canvas Account ID for the sub-account where Training course shells will be created.
*   `masters_sub_account_id`: The Canvas Account ID for the sub-account where Primary Course Template shells will be created.
*   `logger_sheet_id`: The ID of the Google Sheet used for logging course creation and other actions.

## Usage

1.  **Authorization:**
    *   Users first land on `index.html`.
    *   If not logged in, they click "Authorize Canvas Login".
    *   This initiates an OAuth2 flow with VCU Canvas, managed by the Google Apps Script backend.
    *   Upon successful authorization, Canvas redirects to `redirect.html`, which captures the access token and user information, stores it in `sessionStorage`, and then redirects back to `index.html`.

2.  **Course Creation Process:**
    *   The user's name and email are displayed.
    *   The user follows on-screen instructions:
        *   **Step 1: Introduction:** Read guidelines. Click "Next".
        *   **Step 2: Select Option:** Choose course type (Sandbox, Training, Primary). A "Previous" button allows returning to the Introduction.
        *   **Step 3: Guidelines & Agreement:** Read specific guidelines for the chosen type and type "I agree" to proceed.
            *   For Sandbox courses, an API call (`SBCheck`) checks if the user already has a sandbox.
            *   If a sandbox exists, the user is presented with options to manage (reset/delete) it or go back.
        *   **Step 4: Course Configuration:**
            *   Enter course name.
            *   For "Primary" type, also enter Subject and Course Number.
            *   A live preview of the final course name is shown.
        *   **Step 5: Confirmation:** Review course type and name. Click "Submit".
        *   **Step 6: Creation & Result:** An API call (`createCourse` or `SBActions`) is made to the backend.
            *   A success message with a link to the new/modified course is displayed.
            *   Or, an error message is shown if the creation fails.
    *   Users can navigate using "Previous" and "Next" buttons.
    *   A "Logout" button is available to clear the session and return to the initial login state.

## API Backend (`GAS.js` logic)

The JavaScript code makes `fetch` POST requests to a Google Apps Script URL. The `action` parameter in the request body determines the backend operation:

-   `action=login`: Initiates the Canvas OAuth2 login flow. Returns an `authorizationUrl`.
-   `action=logout`: Invalidates the session/token (details depend on GAS implementation).
-   `action=SBCheck`: Checks if the user has existing Sandbox courses. Returns `sb: true/false` and `sbCourses` array.
-   `action=SBActions`: Performs actions on Sandbox courses.
    -   `task=reset`: Resets a sandbox course.
    -   `task=delete`: Deletes a sandbox course.
-   `action=createCourse`: Creates a new course shell based on `type`, `course_name`, etc.

All API interactions require an `accessToken` obtained after login.

### OAuth Scopes

The application requires the following Canvas API OAuth scopes, which are requested during the authorization process handled by `GAS.js`:

-   `url:GET|/api/v1/users/:user_id/profile` (View user profile)
-   `url:GET|/api/v1/users/:user_id/enrollments` (View user enrollments)
-   `url:POST|/api/v1/accounts/:account_id/courses` (Create courses)
-   `url:POST|/api/v1/courses/:course_id/enrollments` (Enroll users in courses)
-   `url:GET|/api/v1/courses/:id` (View course details)
-   `url:POST|/api/v1/courses/:course_id/reset_content` (Reset course content)
-   `url:DELETE|/api/v1/courses/:id` (Delete courses)

Refer to `scopes.md` for a detailed list.

## Error Handling

-   **Authorization Errors:** If Canvas login fails or the user lacks necessary roles, an error message is displayed on `index.html` via URL parameters from `redirect.html`.
-   **API Call Errors:** `fetch` errors or errors returned by the Google Apps Script backend are caught and displayed in the UI.
-   **Input Validation:** Some basic client-side input validation is present (e.g., "I agree" text, required fields for course configuration).

## Styling

-   Uses `resources/css/style.css` for all styling.
-   Includes VCU branding bar via an external script.
-   Responsive design elements (e.g., button grid).

## Support

For support with this tool, VCU faculty and staff can email LSRequest@vcu.edu.

---

This README provides a general overview. Specific details of the Google Apps Script backend implementation would require access to that codebase.
