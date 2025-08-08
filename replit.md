# Overview

This is a web-based invoicing system specifically designed for CARWASH PEÑA BLANCA, a car wash business in Honduras. The system provides thermal receipt printing capabilities with Honduras RTN (tax ID) compliance and basic inventory management functionality. The application allows users to create invoices for car wash services, manage client information, maintain a service catalog, and generate thermal receipts that comply with local tax requirements.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod for validation

## Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Language**: TypeScript with ES modules
- **Development Setup**: Hot reload using Vite middleware in development
- **API Design**: RESTful JSON API with error handling middleware
- **Storage Interface**: Abstract storage interface with in-memory implementation for development

## Data Storage
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Management**: Shared schema definitions between client and server
- **Migration System**: Drizzle Kit for database migrations
- **Development Storage**: In-memory storage implementation with pre-seeded car wash services
- **Production Ready**: PostgreSQL configuration with Neon database support

## Core Business Logic
- **Invoice Generation**: Sequential invoice numbering with Honduras format (001-001-01-XXXXXXXXX)
- **Tax Calculations**: Automatic ISV (sales tax) calculation on taxable items
- **Client Management**: RTN validation for Honduras tax compliance
- **Service Catalog**: Pre-configured car wash services with pricing and categories
- **Thermal Receipt**: Print-ready thermal receipt format optimized for 58mm paper

## External Dependencies
- **Database**: Neon PostgreSQL for production data storage
- **UI Framework**: Radix UI for accessible component primitives
- **Validation**: Zod for runtime type checking and form validation
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Development Tools**: ESBuild for server bundling, TSX for TypeScript execution
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions
- **Date Handling**: date-fns for date manipulation and formatting