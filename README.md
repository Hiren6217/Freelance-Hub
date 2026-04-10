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
5. Add environment-specific auth, uploads, and API wiring before production use.

## Health check

- Backend health endpoint: `GET /api/health`
