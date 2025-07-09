# Required Canvas API OAuth Scopes

This document lists the OAuth scopes required by the application based on its usage of the Canvas API in `GAS.js`.

The following scopes are necessary:

- `url:GET|/api/v1/users/:user_id/profile`
- `url:GET|/api/v1/users/:user_id/enrollments`
- `url:POST|/api/v1/accounts/:account_id/courses`
- `url:POST|/api/v1/courses/:course_id/enrollments`
- `url:GET|/api/v1/courses/:id`
- `url:POST|/api/v1/courses/:id/reset_content`
- `url:DELETE|/api/v1/courses/:id`
