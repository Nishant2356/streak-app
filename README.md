This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Prerequisites

1. **PostgreSQL Database**: Set up a PostgreSQL database (recommended: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Supabase](https://supabase.com), or [Neon](https://neon.tech))
2. **Cloudinary Account**: For image uploads (sign up at [cloudinary.com](https://cloudinary.com))

### Deployment Steps

1. **Push your code to GitHub** (if not already done)

2. **Deploy to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

3. **Configure Environment Variables** in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add the following variables:

   ```
   DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
   NEXTAUTH_SECRET=generate-a-random-secret-key-here
   NEXTAUTH_URL=https://your-app.vercel.app
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Run Database Migrations**:
   - After deployment, run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```
   - Or use Vercel's build command which includes `prisma generate`

5. **Deploy**: Click "Deploy" and wait for the build to complete

### Generating NEXTAUTH_SECRET

Generate a secure secret key:
```bash
openssl rand -base64 32
```

### Local Environment Variables

Create a `.env.local` file in the root directory with the same variables as above (use `http://localhost:3000` for `NEXTAUTH_URL` locally).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
