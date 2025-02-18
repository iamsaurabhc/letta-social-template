# Monorepo Template with NestJS, Next.js, Supabase, Docker, and Vite for Vercel Deployments

A robust monorepo template designed to streamline the development of full-stack applications. This template integrates a NestJS API (server) with a Next.js application (client), utilizes Supabase for both database and authentication, and leverages Docker for consistent containerized deployments on Vercel. Vite is integrated to enable fast, concurrent builds on the Vercel side.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Build Process](#build-process)
- [Deployment](#deployment)
- [Environment Configuration](#environment-configuration)
- [Edge Cases & Considerations](#edge-cases--considerations)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

This template is built to serve as a foundational starting point for future projects, ensuring consistency, scalability, and maintainability. Key highlights include:

- **Monorepo Management:** Utilize pnpm workspaces for centralized dependency management and seamless code sharing across projects.
- **Server & Client Separation:** Develop a NestJS-based API and a Next.js client within the same repository.
- **Modern Data & Auth:** Integration with Supabase for both database operations and user authentication.
- **Containerized Deployments:** Docker-based builds ensuring consistent environments across development, staging, and production.
- **Optimized Builds:** Use Vite for concurrent, lightweight builds to enhance development speed, especially on Vercel.

---

## Architecture

### Monorepo with pnpm Workspaces

- **Centralized Codebase:** All services (server, client, shared utilities) reside in one repository.
- **Efficient Dependency Management:** Leverage pnpm’s workspace capabilities to share common packages and enforce consistent versions.

### Server: NestJS API

- **Functionality:** Handles business logic, RESTful (or GraphQL) endpoints, and integrates with Supabase for authentication and database operations.
- **Middleware:** Includes logging, error handling, and authentication middleware to validate Supabase JWT tokens.
- **Dockerized:** Containerized to ensure consistent behavior across all environments.

### Client: Next.js Application

- **User Interface:** Provides both server-side rendering (SSR) and static generation, ensuring optimal performance and SEO.
- **Vite Integration:** Utilized for specific modules or concurrent builds to speed up development without conflicting with Next.js’s native tooling.
- **API Communication:** Directly calls API endpoints hosted on the NestJS server.

### Supabase Integration

- **Database & Auth:** Acts as the backend for both persistent data storage and user authentication.
- **Token Validation:** The NestJS API validates tokens issued by Supabase to secure endpoints.
- **Direct Client Usage:** The Next.js application can directly interact with Supabase for real-time data updates and authentication workflows.

### Docker & Vercel Deployments

- **Docker:** Both server and client have dedicated Dockerfiles with multi-stage builds for optimal image size.
- **Vercel:** 
  - **Client:** Deployed as a Next.js application with enhanced build times through Vite.
  - **Server:** Containerized NestJS API is deployed using Vercel’s support for custom runtimes.
- **CI/CD Pipeline:** Automated tests, builds, and deployment pipelines ensure continuous delivery.

---

## Project Structure

The repository is organized to clearly separate concerns and promote modular development across services. Below is an in-depth look at each part of the structure:


/monorepo-template ├── packages │ ├── server # NestJS API code │ ├── client # Next.js application │ └── common # Shared utilities, types, and configs ├── .docker │ ├── server.Dockerfile │ └── client.Dockerfile ├── pnpm-workspace.yaml # Workspace configuration for pnpm ├── package.json # Root package configuration └── README.md # This file


### Detailed Breakdown

#### Root Directory
- **pnpm-workspace.yaml**  
  Configures the monorepo for pnpm workspaces. This file defines which directories are part of the workspace and ensures consistent dependency management across packages.
  
- **package.json**  
  Acts as the central package file for shared scripts and common dependencies. This is also used to run global commands across the workspace.

- **README.md**  
  Provides an overview, setup instructions, and guidelines for using this template.

#### `/packages` Directory
This directory contains the core components of the application:

##### `/packages/server`
- **Purpose:**  
  Hosts the NestJS API that handles backend logic, business rules, and interactions with Supabase for database and authentication.
  
- **Key Directories & Files:**
  - **src/**  
    Contains the application’s source code:
    - **main.ts:** Entry point that bootstraps the NestJS application.
    - **app.module.ts:** Root module that imports and configures other modules.
    - **modules/**: Feature-specific modules (e.g., authentication, user management, etc.).
  - **test/**  
    Contains unit and integration tests ensuring API stability.
  - **Configuration Files:**  
    May include environment-specific configuration (or a reference to a centralized configuration in `/packages/common`).

##### `/packages/client`
- **Purpose:**  
  Hosts the Next.js application that serves as the front end. It handles both server-side rendering (SSR) and static site generation for fast, SEO-friendly pages.
  
- **Key Directories & Files:**
  - **pages/**  
    Contains Next.js pages, which may be statically generated or server-rendered.
  - **components/**  
    Houses reusable React components for building the UI.
  - **public/**  
    Static assets such as images, fonts, and icons.
  - **styles/**  
    Global stylesheets and CSS modules to maintain consistent design.
  - **Configuration Files:**  
    May include Next.js-specific configuration (e.g., `next.config.js`) and Vite configuration for enhanced build performance on Vercel.

##### `/packages/common`
- **Purpose:**  
  Contains shared code and configurations used by both the server and client to maintain consistency.
  
- **Key Directories & Files:**
  - **utils/**  
    Utility functions and helper modules that are reused across projects.
  - **types/**  
    Shared TypeScript interfaces and type definitions to ensure consistent data structures.
  - **config/**  
    Common configuration files or constants that are referenced by both the server and client packages.

#### `/.docker` Directory
Contains Docker configurations tailored for each service:

- **server.Dockerfile:**  
  Defines the steps to build a production-ready Docker image for the NestJS API. Typically includes multi-stage builds to optimize image size.
  
- **client.Dockerfile:**  
  Contains the Docker configuration for building and running the Next.js application. This ensures that the client can be deployed in a consistent environment, leveraging Vite for concurrent builds where applicable.

---

This structured layout facilitates:
- **Modularity:** Each component (API, frontend, shared libraries) is developed and maintained independently.
- **Consistency:** Shared utilities and types are centralized to minimize duplication and ensure uniform behavior across services.
- **Scalability:** The clear separation of concerns allows for easier scaling and addition of new features or modules in future projects.
