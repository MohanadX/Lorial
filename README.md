# 🎟️ Lorial

A modern, full-stack event booking and management platform built with **Next.js 16**, React 19, and MongoDB. Lorial provides a seamless experience for users to discover and book events, manage their profiles, and track their bookings.

<div align="center">
  <img src="/public/images/lorial.jpg" alt="Lorial Preview" />
</div>

## ✨ Key Features

- **Event Discovery**: Browse and view detailed information about upcoming events.
- **Seamless Booking**: Easy-to-use event booking system for attendees.
- **User Dashboard**: Manage your profile and view your booking history in one place.
- **Secure Authentication**: Robust user authentication and session management powered by NextAuth.js.
- **Optimized Media**: Integrated with ImageKit for fast, efficient image delivery.
- **Analytics & Insights**: Built-in user tracking and product analytics using PostHog.
- **Type Safety**: End-to-end type safety with TypeScript and Zod schema validation.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Frontend**: React 19, Tailwind CSS v4, Lucide React
- **State & Data Fetching**: React Query, Axios
- **Backend**: Next.js API Routes & Server Actions
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **Analytics**: [PostHog](https://posthog.com/)
- **Media Management**: [ImageKit](https://imagekit.io/)
- **Validation**: [Zod](https://zod.dev/)

## 📁 Project Structure

```text
├── app/                  # Next.js App Router pages and API routes
├── components/           # Reusable UI components
├── database/             # Mongoose schemas and database connection logic
├── lib/                  # Utility functions, Server Actions, and shared logic
├── public/               # Static assets
└── tailwind.config.ts    # Tailwind CSS configuration (if applicable)
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun
- MongoDB Database

### Environment Variables

Create a `.env.local` file in the root directory and add your required environment variables. Based on the tech stack, you will likely need to configure the following:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# NextAuth
AUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host

# ImageKit
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_imagekit_url
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/lorial.git
   cd lorial
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

## Developer

**Mohanad Ayoub** [GitHub profile](https://github.com/zlmohanadlz) - [Linkedin Profile](https://www.linkedin.com/in/mohanad-ayoub-55bb29382)
