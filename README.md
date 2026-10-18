# 101438565_COMP3123_Assignment1

# Project Description

This project is a RESTful API built using Node.js, Express.js, and MongoDB. It provides user registration and login, JWT authentication, and employee CRUD operations.

The application uses MongoDB to store users and employee records. Each employee is associated with the user who created the record. Users can only view, update, and delete their own employees.

# Technologies Used
Node.js
Express.js
MongoDB
Mongoose
bcryptjs
jsonwebtoken
express-validator
express-rate-limit
Helmet
Winston
Morgan
dotenv
Jest
Postman

# Installation and Setup
Clone the Repository
git clone https://github.com/cms-nno/101438565_COMP3123_Assignment1.git
cd 101438565_COMP3123_Assignment1

Install Dependencies
npm install

Environment Variables

Create a .env file in the project root and configure the required environment variables.

Example:

PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/comp3123_assignment1
JWT_SECRET=your_jwt_secret
NODE_ENV=development


The variable names must match the ones used in the application. Actual secrets and database credentials should not be committed to Git.

# Start MongoDB

Make sure MongoDB is running before starting the application. The application uses the database comp3123_assignment1.

The server should not start if the MongoDB connection fails.

Start the Application

Development mode:

npm run dev


Normal mode:

npm start


The application runs using server.js. Nodemon is used during development to restart the server when changes are made.

# API Endpoints

The API contains two main resources: Users and Employees.

User Endpoints
Method	Endpoint	Description
POST	/api/v1/user/signup	Register a new user
POST	/api/v1/user/login	Log in and receive a JWT

Signup example:

{
  "username": "userA",
  "email": "userA_test02@example.com",
  "password": "TestPass123!"
}


Passwords are hashed before being stored in the database. Duplicate usernames or email addresses return an appropriate error response.

Login requires valid credentials. A successful login returns a JWT that can be used to access protected endpoints.

Employee Endpoints
Method	Endpoint	Description
POST	/api/v1/employee	Create an employee
GET	/api/v1/employee	Get the current user's employees
GET	/api/v1/employee/:id	Get an employee by ID
PUT	/api/v1/employee/:id	Update an employee
DELETE	/api/v1/employee/:id	Delete an employee

Employee endpoints require authentication. The exact endpoint paths and request fields should match the implemented routes and employee model.

# Authentication and Authorization

The application uses JWT authentication to protect employee endpoints.

When a user signs up, the application validates the submitted information and hashes the password using bcryptjs. During login, the submitted password is compared with the stored password hash. If the credentials are valid, a JWT is generated.

The token must be included in the request header when accessing protected endpoints.

Authorization: Bearer <your_jwt_token>


The authentication middleware verifies the token and identifies the logged-in user. Requests with missing, invalid, or expired tokens return 401 Unauthorized.

User and Employee Relationship

Each employee record belongs to the user who created it. The relationship is stored in MongoDB using Mongoose.

When an employee is created, the application associates the record with the authenticated user's ID. Employee queries, updates, and deletions check both the employee ID and the owner's user ID.

This prevents users from accessing or modifying employee records belonging to other users. If an employee does not exist or belongs to another user, the API returns 404 Not Found.

# Security
Password Hashing

The application uses bcryptjs to hash passwords before storing them in MongoDB. Plaintext passwords are not stored.

JWT Authentication

JWTs are used to authenticate requests to protected endpoints. Tokens are verified by the authentication middleware before the request is allowed to continue.

Helmet

Helmet adds HTTP security headers to help protect the application against common web vulnerabilities.

Input Validation

The application uses express-validator to validate request data. Invalid input and employee IDs are rejected before database operations are performed.

Environment Variables

The dotenv package loads configuration from the .env file. Sensitive information, including JWT secrets and database credentials, should not be hard-coded or committed to the repository.

Rate Limiting

The application uses express-rate-limit to protect the API against excessive requests and help reduce brute-force attacks.

Configuration:

Limit: 100 requests per IP address.
Time window: 15 minutes.
Protected routes: All routes under /api, including user signup, user login, and employee endpoints.
Exceeded limit: HTTP 429 Too Many Requests.

Rate limiting was tested using Postman against POST /api/v1/user/login.

An initial request with invalid credentials returned HTTP 401 Unauthorized. After the configured request limit was exceeded, the server returned HTTP 429 Too Many Requests. These results confirmed that the rate limiter was operating as expected during testing.

# Error Handling

The API returns JSON responses for errors and uses appropriate HTTP status codes.

400 Bad Request: Invalid input, validation failures, malformed JSON, or invalid employee IDs.
401 Unauthorized: Missing, invalid, or expired JWTs, or invalid login credentials.
404 Not Found: Unsupported routes or employees that do not exist or belong to another user.
409 Conflict: Duplicate usernames or email addresses during registration.
413 Payload Too Large: Request bodies exceeding the configured size limit.
429 Too Many Requests: Requests exceeding the configured rate limit.
500 Internal Server Error: Unexpected application or database errors.

Error responses do not expose passwords, JWT secrets, database credentials, or stack traces. Unexpected errors are logged on the server, while clients receive generic error messages.

The application also prevents startup when the MongoDB connection fails.

# HTTP Status Codes
Status Code	Description
200 OK	The request succeeded, such as retrieving employees or updating an employee.
201 Created	A new user or employee was created.
204 No Content	An operation succeeded without returning a response body, such as employee deletion.
400 Bad Request	The request contains invalid input.
401 Unauthorized	Authentication is missing or invalid.
403 Forbidden	The authenticated user is not permitted to perform an operation, if applicable.
404 Not Found	The requested route or resource could not be found.
409 Conflict	The request conflicts with existing data, such as a duplicate username or email.
413 Payload Too Large	The request body exceeds the configured size limit.
429 Too Many Requests	The client exceeded the rate limit.
500 Internal Server Error	An unexpected server-side error occurred.
Health Check Endpoint

The API provides a health-check endpoint to verify that the server is running and responding to requests.

Endpoint: GET /health

Success response: 200 OK

Example response:

{
  "status": "OK",
  "message": "API is running",
  "timestamp": "2026-10-18T12:00:00.000Z"
}


The timestamp represents the time the response was generated.

Local Logging

The application uses Winston for local application logging and Morgan for HTTP request logging.

Log files:

logs/application.log records server startup, HTTP requests, successful operations, validation failures, authentication failures, and warnings.
logs/error.log records application errors.
logs/sample.log contains illustrative log entries for demonstration.

Logged events include:

Server startup
HTTP method, request path, response status, and request duration
Successful user registration and login
Failed login attempts
Missing, invalid, and expired authentication tokens
Employee creation, retrieval, updates, and deletion
Validation failures, missing employees, unsupported routes, and application errors

Passwords, JWT secrets, complete authentication tokens, and database credentials are not intentionally written to logs.

Generated log files are excluded from version control. A sanitized sample is included for demonstration.

Logging was tested using Postman by sending successful requests and requests that returned errors, then checking the resulting local log files.

# Testing

The API can be tested using Postman. The project also includes a Jest test script.

Run the tests using:

npm test


Postman testing should include user registration, login, JWT authentication, employee CRUD operations, invalid requests, rate limiting, and attempts to access employees belonging to another user.

The health-check endpoint can be tested using:

GET /health

