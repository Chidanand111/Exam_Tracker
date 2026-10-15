# API Documentation & Contract Specification — BharatExam Tracker

## 1. Overview & Conventions

All endpoints are hosted under `/api/*` and return standard JSON responses.

### Base Standards
- **Content-Type**: `application/json`
- **Response Format**:
  - Success responses: JSON object containing data or `{ success: true, ... }`.
  - Error responses: `{ success: false, error: string, code?: string, details?: any }`.
- **Status Codes**:
  - `200 OK`: Request succeeded.
  - `201 Created`: Resource created.
  - `400 Bad Request`: Payload validation failed or required parameters missing.
  - `401 Unauthorized`: Session missing or expired.
  - `403 Forbidden`: Authenticated user lacks required role (e.g. non-admin accessing admin route).
  - `404 Not Found`: Target resource does not exist.
  - `500 Internal Server Error`: Unhandled server exception (internal details redacted).

---

## 2. Authentication & Authorization

Authentication utilizes secure HTTP-only cookies (`bharat_exam_session`).

| Endpoint | Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticates credentials and sets the session cookie. |
| `/api/auth/register` | `POST` | Public | Registers a new aspirant account and sets the session cookie. |
| `/api/auth/me` | `GET` | Optional | Returns current user profile if session exists, else `null`. |
| `/api/auth/logout` | `POST` | Public | Clears the session cookie. |

### Authentication Request Example
`POST /api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "your-secure-password"
}
```
*Or 1-click evaluation demo:*
```json
{
  "demoRole": "aspirant"
}
```

### Authentication Success Response
```json
{
  "user": {
    "id": "cm0abc12345",
    "email": "aspirant@bharatexam.in",
    "name": "Fresher Aspirant",
    "role": "ASPIRANT"
  }
}
```

---

## 3. Core Recruitment Endpoints

### Query Recruitments
`GET /api/recruitments`
Returns a list of published government recruitments based on filters.

#### Query Parameters
| Parameter | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `search` | string | No | Keyword or organization name | `ssc cgl` |
| `qualification` | string | No | Minimum degree filter | `Graduate`, `B.Tech` |
| `fresherOnly` | boolean | No | Only show recruitments with 0 years experience required | `true` |
| `state` | string | No | State or All India location | `Central`, `Maharashtra` |
| `sort` | string | No | Sorting criterion | `newest`, `closing-soon`, `salary` |
| `limit` | number | No | Results per page (default: 20) | `20` |
| `offset` | number | No | Pagination offset | `0` |

#### Response Example
```json
{
  "recruitments": [
    {
      "id": "rec_ssc_cgl_2026",
      "slug": "ssc-cgl-2026",
      "title": "Combined Graduate Level Examination 2026",
      "organization": {
        "id": "org_ssc",
        "name": "Staff Selection Commission",
        "code": "SSC"
      },
      "totalVacancies": 14582,
      "qualification": "Graduate",
      "appDeadline": "2026-11-20T23:59:59.000Z",
      "officialPortalUrl": "https://ssc.gov.in",
      "stages": [
        { "id": "stg_1", "stageOrder": 1, "title": "Tier 1 Computer Based Exam", "status": "SCHEDULED" }
      ]
    }
  ],
  "total": 48
}
```

---

## 4. Shortlist Endpoints

### Fetch Shortlisted Recruitment IDs
`GET /api/shortlist`
- **Auth**: Required (`ASPIRANT` or `ADMIN`)
- **Response**:
```json
{
  "shortlistedIds": ["rec_ssc_cgl_2026", "rec_ibps_po_2026"]
}
```

### Toggle Shortlist State
`POST /api/shortlist`
- **Auth**: Required
- **Request Body**:
```json
{
  "recruitmentId": "rec_ssc_cgl_2026"
}
```
- **Response**:
```json
{
  "success": true,
  "shortlisted": true,
  "recruitmentId": "rec_ssc_cgl_2026"
}
```

---

## 5. Application Tracking Endpoints

### Apply / Start Tracking a Recruitment
`POST /api/applications`
- **Auth**: Required
- **Request Body**:
```json
{
  "recruitmentId": "rec_ssc_cgl_2026",
  "registrationNumber": "SSC2026998811",
  "rollNumber": "2201004589"
}
```
- **Response**:
```json
{
  "success": true,
  "application": {
    "id": "app_987",
    "recruitmentId": "rec_ssc_cgl_2026",
    "currentStageOrder": 1,
    "status": "APPLIED"
  }
}
```

---

## 6. Error & Validation Formats

### Validation Error (400)
When runtime validation catches malformed or invalid inputs:
```json
{
  "success": false,
  "error": "recruitmentId must be a non-empty string under 128 characters",
  "code": "VALIDATION_ERROR"
}
```

### Authentication Failure (401)
When requesting a protected endpoint without valid credentials:
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

### System Exception (500)
When an uncaught exception occurs, diagnostic details are securely logged to the server, and a sanitized response is sent to the client:
```json
{
  "success": false,
  "error": "An unexpected error occurred while processing your request.",
  "code": "INTERNAL_SERVER_ERROR"
}
```
