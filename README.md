# Spray Application Calculator

A full-stack web application designed for golf course greenskeepers to calculate and manage spray equipment settings and application tracking. Plan spray applications with real-time calculations for nozzle pressure, flow rates, and coverage areas.

## Features

- **Real-time Spray Calculations**: Automatically calculate flow rates, required pressure, tank requirements, and coverage based on equipment settings
- **Multi-Area Planning**: Configure applications across different golf course areas (greens, tees, fairways, rough)
- **Nozzle Catalog**: Select from a catalog of spray nozzles with accurate pressure curve data
- **Application History**: Save and manage spray application records with user authentication
- **Live Feedback**: Interactive sliders and forms provide instant validation and metric updates

## Tech Stack

- **Frontend:** React 19, Next.js 16 (App Router), TypeScript
- **Styling:** Tailwind CSS, shadcn/ui, Radix UI
- **Forms & Validation:** React Hook Form, Zod schemas
- **Database:** PostgreSQL, Prisma ORM
- **Authentication:** Better Auth
- **Email:** Resend, React Email

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up your environment variables:

```bash
cp .env.example .env
```

Configure the following in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Secret key for authentication
- Additional auth and email configuration as needed

3. Set up the database:

```bash
npx prisma migrate dev
npx prisma generate
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
app/
├── applications/       # Application create/edit pages
├── dashboard/          # User dashboard and application list
└── generated/          # Prisma client output
components/
├── application-form/   # Main form components
└── ui/                 # shadcn/ui components
lib/
├── actions/            # Server actions
├── application/        # Types and schemas
└── data/               # Nozzle catalog data
prisma/
└── schema.prisma       # Database schema
```

## Database Setup

The application uses Prisma with PostgreSQL. Key models:
- `User`: User accounts and authentication
- `Application`: Spray application records
- `ApplicationArea`: Individual treatment areas within applications

Run migrations with:
```bash
npx prisma migrate dev
```

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```
