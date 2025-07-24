# Web Vulnerability Showcase Portal

This project is an interactive educational tool designed for developers and security learners. It demonstrates common web vulnerabilities like SQL Injection (SQLi) and Cross-Site Scripting (XSS) in a controlled environment. Users can toggle between "vulnerable" and "secure" modes to see exploits in action and understand how to mitigate them.

---

## Key Features

* **SQLi Demo**: An interactive login form that is vulnerable to SQL Injection.
* **XSS Demo**: A comment box susceptible to stored Cross-Site Scripting.
* **Vulnerable/Secure Toggle**: Switch between vulnerable and secured versions of the forms to compare behavior.
* **Secure Implementations**: Demonstrates the use of prepared statements (via Prisma) and Content Security Policy (CSP) headers to prevent these attacks.
* **API Logging**: Attempts to exploit the system are logged for educational review.

---

## Technologies Used

* **Framework**: Next.js
* **Styling**: Tailwind CSS
* **UI Components**: shadcn/ui
* **Database**: SQLite
* **ORM**: Prisma
* **Language**: TypeScript

---

## How to Run Locally

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up the database**:
    ```bash
    npx prisma migrate dev --name init
    ```
    This will create the `dev.db` SQLite file and set up the necessary tables. You can optionally run `npx prisma db seed` if you create a seed file.

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

---

## API Overview

### Authentication

* `POST /api/auth/login-vulnerable`
    * Logs a user in using a raw SQL query. **Vulnerable to SQLi.**
    * **Body**: `{ "username": "admin", "password": "' OR '1'='1" }`
* `POST /api/auth/login-secure`
    * Logs a user in using Prisma's query engine (prepared statements). **Secure.**
    * **Body**: `{ "username": "admin", "password": "password123" }`

### Comments

* `GET /api/comments`
    * Fetches all comments from the database.
* `POST /api/comments/post-vulnerable`
    * Adds a new comment. **Vulnerable to stored XSS.**
    * **Body**: `{ "content": "<script>alert('XSS!')</script>" }`
* `POST /api/comments/post-secure`
    * Adds a new comment after sanitizing input. **Secure.**
    * **Body**: `{ "content": "This is a safe comment." }`

---

## Security Features Implemented

* **SQL Injection Mitigation**: Use of **Prisma ORM** which relies on **prepared statements** to neutralize SQLi attacks.
* **XSS Mitigation**:
    * **Output Encoding**: React renders text by default, preventing raw HTML from being injected into the DOM.
    * **Content Security Policy (CSP)**: A strict CSP header is set via middleware to block inline scripts and limit script sources.
* **Secure Cookies**: If implementing sessions, use `HttpOnly`, `Secure`, and `SameSite` attributes.

---

## Roles of Group Members

* **Mahmudul Alam**: Project Lead, Backend Development (API and Database).
* **Siddikul Islam**: Frontend Development (React Components and State Management).
* **Ziaur Rahman**: Security Research & Documentation (Vulnerability testing, README).