# 101438565_COMP32123_Assignment1



Rate Limiting
The application uses express-rate-limit to protect the API against excessive requests and help reduce brute-force attacks.

Configuration
Limit: 100 requests per IP address.
Time window: 15 minutes.
Protected routes: All routes under /api, including user signup, user login, and employee endpoints.
Exceeded limit: The server responds with HTTP 429 Too Many Requests and the message Too many requests. Please try again later.
Testing
Rate limiting was tested using Postman against POST /api/v1/user/login.

An initial request with invalid credentials returned HTTP 401 Unauthorized.
After the configured request limit was exceeded, the server returned HTTP 429 Too Many Requests.
These results confirmed that the API rate limiter was operating as expected during testing.

Error Handling
The API returns JSON responses for errors and uses appropriate HTTP status codes.

400 Bad Request: Invalid input, validation failures, malformed JSON, or invalid employee IDs.
401 Unauthorized: Missing, invalid, or expired JWTs, and invalid login credentials.
404 Not Found: Unsupported routes and employees that do not exist or belong to another user.
409 Conflict: Duplicate usernames or email addresses during registration.
413 Payload Too Large: Request bodies exceeding the configured body-size limit.
429 Too Many Requests: Requests exceeding the configured rate limit.
500 Internal Server Error: Unexpected server or database errors.

Error responses avoid exposing passwords, JWT secrets, database credentials, and stack traces. Unexpected errors are logged on the server, while clients receive generic error messages.

The application also prevents startup when the MongoDB connection fails.