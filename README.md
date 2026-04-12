# FreelanceHub

FreelanceHub is a referral-first freelance hiring platform with a Next.js frontend, Spring Boot backend, and MySQL database.

## What is currently present

- `frontend/`: branded Next.js app shell with landing, login, and dashboard pages
- `backend/`: Spring Boot app shell with security config and `/api/health`
- `database/freelancehub_db.sql`: MySQL schema file
- `frontend/public/freelancehub-logo.svg`: platform logo

## Deployment status

This folder is now structurally valid again, but it is **not fully deployment-verified yet** because dependencies have not been installed and builds have not been executed in this session.

## Before deployment

1. In `database/`, import `freelancehub_db.sql` into MySQL.
2. In `frontend/`, run `npm install` then `npm run build`.
3. In `backend/`, run `mvn spring-boot:run` or package it with Maven.
4. Replace database credentials in `backend/src/main/resources/application.yml`.
5. Configure email delivery settings using environment variables (see below).
6. Add environment-specific auth, uploads, and API wiring before production use.

## Email delivery setup

The backend uses Spring Mail for OTP delivery. Configure the following environment variables before starting the backend:

- `SPRING_MAIL_HOST` (e.g. `smtp.gmail.com` or Mailtrap host)
- `SPRING_MAIL_PORT` (e.g. `587`)
- `SPRING_MAIL_USERNAME` (your SMTP username)
- `SPRING_MAIL_PASSWORD` (your SMTP password or app password)
- `SPRING_MAIL_FROM` (optional, defaults to `SPRING_MAIL_USERNAME`)

For Gmail, use an app password and keep `starttls.enable` enabled.

If email sending is not possible in local development, the app also supports OTP fallback, which will display the OTP code directly in the signup/login response.

## Health check

- Backend health endpoint: `GET /api/health`
