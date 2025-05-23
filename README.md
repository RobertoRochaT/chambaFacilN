# Chamba Facil Frontend and Backend

### Overview

### Purpose and Scope

This document provides a high-level overview of the chambaFacilN repository,
a comprehensive freelance marketplace platform that connects users with freelancers and companies. The system consists of two primary applications: a main marketplace application handling job postings, user management, and company operations, and a separate integrated chat system for real-time communication.

For detailed information about the main application architecture, see Main Application. For specific documentation about the chat system integration, see Chat Application.

### System Architecture Overview

The chambaFacilN platform follows a microservices-inspired architecture with two distinct but integrated applications sharing common data sources and user authentication systems.

### Core Application Structure

<img width="1135" alt="Captura de pantalla 2025-05-22 a la(s) 11 09 09 p m" src="https://github.com/user-attachments/assets/dbe92f78-75d3-4fb8-9b4b-39ee74adb140" />

### User Types and Authentication System

The platform implements a dual authentication system supporting three distinct user types, each with different authentication flows and capabilities.

### Authentication Flow Architecture
<img width="1136" alt="Captura de pantalla 2025-05-22 a la(s) 11 09 49 p m" src="https://github.com/user-attachments/assets/2e8b1888-728e-4343-9529-2c995e3f9f51" />

### Core Components

##### Main Application Components

| Component           | Purpose                                              | Key Files                          |
| ------------------- | ---------------------------------------------------- | ---------------------------------- |
| Express Server      | Main API server handling marketplace operations      | `server/server.js`                 |
| Clerk Integration   | User authentication and webhook synchronization      | `server/controllers/webhooks.js`   |
| React Frontend      | User interface for job browsing and applications     | `client/src/App.jsx`               |
| Route Handlers      | API endpoints for different user types               | `server/routes/*.js`               |

##### Chat System Components
| Component             | Purpose                                           | Key Files                                  |
| --------------------- | ------------------------------------------------- | ------------------------------------------ |
| Chat Backend          | Separate Express server for chat functionality    | `chatF/Chat_App/backend/`                  |
| Chat Frontend         | React application for messaging interface         | `chatF/Chat_App/frontend/`                 |
| Chat Authentication   | JWT-based auth with main app integration          | `authorization.js`                         |

#### Integration Architecture

##### Webhook-Driven Data Synchronization

The system uses Clerk webhooks to maintain user data consistency between the authentication service and local database. The clerkWebhooks function handles three primary events:

- user.created: Creates new user records in MongoDB
- user.updated: Synchronizes user profile changes
- user.deleted: Removes user records from the database

##### Cross-Application Communication

The chat system integrates with the main application through:

1. External User Signup: Users from the main app can access chat functionality
2. Shred Database: Both applications access the same MongoDB instance
3. Token-Based Authentication: Chat system validates users through JWT tokens

##### Route Structure

| Route Pattern         | Purpose                           | Authentication           |
| --------------------- | --------------------------------- | ------------------------ |
| `/api/users/*`        | Regular user operations           | Clerk middleware         |
| `/api/freelancers/*`  | Freelancer management             | JWT tokens               |
| `/api/company/*`      | Company operations                | JWT tokens               |
| `/webhooks`           | Clerk user synchronization        | Webhook signatures       |
| `/chat`               | Chat application accyess           | Cross-app integration    |

##### Key Technical Characteristics

- **Microservices Architecture:** Separate applications for marketplace and chat functionality
- **Multi-Tier Authentication:** Clerk for regular users, JWT for freelancers/companies
- **Real-Time Synchronization:** Webhook-driven user data consistency
- **Cross-Platform Integration:** Shared database with independent deployment capabilities
- **Role-Based Access Control:** Different user types with distinct capabilities and interfaces

