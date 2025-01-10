# Thesis Management System

A comprehensive web application for managing academic courses, assignments, and thesis supervision in an educational setting. Built with React, TypeScript, and modern web technologies.

## Features

- **User Role Management**

  - Admin dashboard for user and course management
  - Supervisor interface for course and assignment oversight
  - Student portal for assignment submission and course interaction

- **Course Management**

  - Create and manage academic courses
  - Assign supervisors and students
  - Track course progress and submissions

- **Assignment Handling**
  - Create and distribute assignments
  - Submit and review assignments
  - Grade management system

## Tech Stack

- **Frontend**

  - React with TypeScript
  - Vite for build tooling
  - Tailwind CSS for styling
  - React Router for navigation

- **Backend**
  - Node.js with Express
  - Prisma ORM
  - PostgreSQL database
  - JWT authentication

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone [repository-url]
cd thesis-mgmt
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables

```bash
cp .env.example .env
# Update the .env file with your configuration
```

4. Run database migrations

```bash
npx prisma migrate dev
```

5. Start the development server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components for different roles
├── services/      # API and business logic services
├── utils/         # Utility functions and helpers
└── App.tsx        # Main application component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
