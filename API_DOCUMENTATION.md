# API Documentation

## Base URL
`http://localhost:3000/api`

## Authentication Endpoints

### POST /auth/login-vulnerable
**Description**: Vulnerable login endpoint that demonstrates SQL injection attacks.

**⚠️ SECURITY WARNING**: This endpoint is intentionally vulnerable and should never be used in production.

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Sample SQL Injection Payload**:
```json
{
  "username": "admin",
  "password": "' OR '1'='1"
}
```

**Response**:
- **200 OK**: Login successful
  ```json
  {
    "message": "Login successful (Vulnerable Mode)"
  }
  ```
- **401 Unauthorized**: Invalid credentials
  ```json
  {
    "message": "Invalid credentials"
  }
  ```

**Security Features**:
- ❌ No SQL injection protection
- ✅ Logs suspicious SQL injection patterns
- ✅ Tracks all login attempts for learning purposes

---

### POST /auth/login-secure
**Description**: Secure login endpoint using prepared statements via Prisma ORM.

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**:
- **200 OK**: Login successful
  ```json
  {
    "message": "Login successful (Secure Mode)"
  }
  ```
- **401 Unauthorized**: Invalid credentials
  ```json
  {
    "message": "Invalid credentials"
  }
  ```

**Security Features**:
- ✅ SQL injection protection via Prisma prepared statements
- ✅ HTTP-only secure cookies for session management
- ✅ Logs all login attempts for analysis

---

## Comments Endpoints

### GET /comments
**Description**: Retrieves all comments from the database.

**Query Parameters**: None

**Response**:
- **200 OK**: Array of comments
  ```json
  [
    {
      "id": 1,
      "content": "This is a comment",
      "createdAt": "2023-08-20T10:30:00.000Z"
    }
  ]
  ```
- **500 Internal Server Error**: Database error
  ```json
  {
    "message": "Could not fetch comments."
  }
  ```

---

### POST /comments/post-vulnerable
**Description**: Creates a new comment without sanitization, vulnerable to XSS attacks.

**⚠️ SECURITY WARNING**: This endpoint is intentionally vulnerable and should never be used in production.

**Request Body**:
```json
{
  "content": "string"
}
```

**Sample XSS Payload**:
```json
{
  "content": "<img src=\"x\" onerror=\"alert('XSS Attack!')\" />"
}
```

**Response**:
- **201 Created**: Comment created successfully
  ```json
  {
    "id": 2,
    "content": "<img src=\"x\" onerror=\"alert('XSS Attack!')\" />",
    "createdAt": "2023-08-20T10:35:00.000Z"
  }
  ```
- **400 Bad Request**: Empty content
  ```json
  {
    "message": "Comment cannot be empty."
  }
  ```

**Security Features**:
- ❌ No XSS protection - stores raw HTML
- ✅ Logs suspicious XSS patterns
- ✅ Tracks comment submissions for analysis

---

### POST /comments/post-secure
**Description**: Creates a new comment with server-side sanitization using DOMPurify.

**Request Body**:
```json
{
  "content": "string"
}
```

**Response**:
- **201 Created**: Comment created successfully
  ```json
  {
    "id": 3,
    "content": "Sanitized content without HTML tags",
    "createdAt": "2023-08-20T10:40:00.000Z"
  }
  ```
- **400 Bad Request**: Empty content
  ```json
  {
    "message": "Comment cannot be empty."
  }
  ```

**Security Features**:
- ✅ XSS protection via DOMPurify sanitization
- ✅ Logs suspicious XSS patterns for learning
- ✅ Defense-in-depth approach

---

## Security Monitoring Endpoints

### GET /security/logs
**Description**: Retrieves security event logs for educational analysis.

**Query Parameters**:
- `type` (optional): Filter by event type (`sql_injection`, `xss_attempt`, `login_attempt`)
- `minutes` (optional): Filter logs from last N minutes (default: 60)

**Sample Request**:
```
GET /api/security/logs?type=sql_injection&minutes=30
```

**Response**:
- **200 OK**: Security logs
  ```json
  {
    "logs": [
      {
        "timestamp": "2023-08-20T10:30:00.000Z",
        "type": "sql_injection",
        "severity": "high",
        "details": {
          "endpoint": "/api/auth/login-vulnerable",
          "payload": "username: admin, password: ' OR '1'='1",
          "userAgent": "Mozilla/5.0...",
          "ip": "127.0.0.1"
        }
      }
    ],
    "count": 1,
    "filters": {
      "type": "sql_injection",
      "minutes": 30
    }
  }
  ```

---

## Test Data

### Default Users
The following test users are created by the database seed:

```json
[
  {
    "username": "admin",
    "password": "password123"
  },
  {
    "username": "user", 
    "password": "user123"
  }
]
```

### Sample Test Payloads

**SQL Injection Payloads**:
- `' OR '1'='1`
- `admin'--`
- `' UNION SELECT * FROM User--`

**XSS Payloads**:
- `<script>alert('XSS')</script>`
- `<img src="x" onerror="alert('XSS')" />`
- `<svg onload="alert('XSS')" />`

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "timestamp": "2023-08-20T10:30:00.000Z"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized  
- `500`: Internal Server Error

---

## Security Headers

The application implements the following security headers via middleware:

- **Content-Security-Policy**: Blocks inline scripts and restricts resource loading
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

---

## Rate Limiting

Currently not implemented. In a production environment, you would want to add rate limiting to prevent:
- Brute force login attempts
- Comment spam
- API abuse

---

## Analytics Tracking

The application tracks the following events (anonymized):
- Vulnerability demonstration attempts
- Security mode toggles
- Login success/failure rates
- Comment submission patterns

**Privacy**: No sensitive data is tracked. All analytics focus on educational usage patterns.
