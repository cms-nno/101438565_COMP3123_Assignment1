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