# Technical Specification

## System Overview
- Core purpose: Manage courses, students, and assignments in an academic setting.
- Current capabilities: User authentication, course creation and management, assignment creation and submission, and grading.
- Existing system boundaries: Limited to course, student, and assignment management within an academic context.
- Active integrations: Prisma for database interactions, React for frontend, Express.js for backend, and Tailwind CSS for styling.

## Architecture
- Current component structure: Modular architecture with separate modules for user management, course management, and assignment management.
- Implemented data flow patterns: RESTful APIs for data retrieval and updates, with client-side making requests to the server-side.
- Existing technical stack: React, Node.js, Express.js, Prisma, PostgreSQL, Tailwind CSS, and Vite.

## Implementation
- Core components and algorithms: `CourseService` for course management, `AssignmentService` for assignment management, and `AuthService` for authentication.
- Active integration points: Prisma client for database interactions, Express.js routes for API endpoints, and React components for frontend rendering.
- Current data management: Prisma schema defines the database structure and relationships between entities.
- Implemented security measures: JWT-based authentication, role-based access control, and rate limiting for login attempts.

## Core Functionality
- Key functionality: User registration, login, logout, password reset, course creation and management, assignment creation and submission, and grading.
- Main use cases: Supervisors creating and managing courses and assignments, students submitting assignments, and administrators managing users and courses.