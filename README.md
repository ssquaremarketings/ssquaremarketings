# My Real Estate App

A complete real estate web app built with Next.js 14, Tailwind CSS, Supabase, and Cloudinary.

## What this project does

- Publishes real estate projects on the public visitor site.
- Lets visitors submit enquiries that are saved as leads in Supabase.
- Gives admins a CMS to add, edit, publish, and delete projects.
- Uploads project images and brochure PDFs to Cloudinary for permanent public URLs.
- Lets admins view, filter, update, export, and delete leads.
- Supports admin password changes through Supabase Auth.

## Tech Stack

- Next.js 14 App Router
- Tailwind CSS
- Supabase Postgres, Auth, and REST API
- Cloudinary unsigned uploads for images and PDFs
- Vercel for deployment

## One-Time Setup

### 1) Create the Supabase project

1. Create a free account at https://supabase.com.
2. Create a new project.
3. Open SQL Editor and run this schema:

```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tag TEXT CHECK (tag IN ('available','hot-deal','featured')) NOT NULL,
  location TEXT NOT NULL,
  price TEXT NOT NULL,
  price_per_sqyd TEXT,
  area TEXT,
  description TEXT,
  image_url TEXT,
  brochure_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  budget TEXT,
  property TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','called','visited','closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published projects"
  ON projects FOR SELECT USING (published = true);
CREATE POLICY "Admin full access projects"
  ON projects FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access leads"
  ON leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public can insert leads"
  ON leads FOR INSERT WITH CHECK (true);
```

4. Go to Authentication → Users and add one admin user with email and password.
5. Copy the Supabase URL and anon key from Project Settings → API.

### 2) Create the Cloudinary setup

1. Create a free account at https://cloudinary.com.
2. Go to Settings → Upload → Upload presets.
3. Add a new upload preset.
4. Set Signing mode to Unsigned.
5. Set Delivery type to Upload (public) and keep access mode public.
6. Leave Folder blank.
7. Copy the preset name and cloud name.

Brochure uploads in this app use Cloudinary `raw/upload` so PDF URLs are public and open directly in a new tab.

### 3) Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxxx
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=xxxx
NEXT_PUBLIC_CONTACT_PHONE=+91-XXXXXXXXXX

Add your contact phone number to `NEXT_PUBLIC_CONTACT_PHONE` so the site uses it in the visitor contact cards and footer. Example:

```env
# .env.local
NEXT_PUBLIC_CONTACT_PHONE=+919812345678
```
```

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repo in Vercel.
3. Add the environment variables in the Vercel dashboard.
4. Deploy.

## Admin Login

1. Open `/admin/login`.
2. Enter the Supabase Auth email and password you created.
3. You will be redirected to the admin dashboard.

## Add Projects

1. Go to `/admin/projects`.
2. Click Add New Project.
3. Fill in the required project details.
4. Upload the project image and brochure PDF.
5. Save the project.
6. Toggle Published to make it appear on the visitor site.

## View Leads

1. Go to `/admin/leads`.
2. Filter by status, property, or name/phone.
3. Update the lead status from the actions column.
4. Delete leads when they are no longer needed.
5. Use Export CSV to download the current leads list.

## Change Admin Password

1. Open `/admin/settings`.
2. Enter the new password twice.
3. Save changes.
4. The new password will be required on the next login.

## Free Tier Limits Summary

- Supabase free tier is enough for a small-to-medium brochure site and lead workflow.
- Cloudinary free tier gives permanent public URLs for uploaded images and PDFs.
- Vercel free tier is enough for a single freelance client site with auto deploys.

## If Storage Runs Out

1. Upgrade Supabase storage or remove unused projects/leads.
2. Clean up old Cloudinary assets if needed.
3. Move to a paid plan only if the business grows beyond the free limits.

## Notes

- Visitor brochures are direct Cloudinary URLs, so they open in any browser without login.
- Project publishing is controlled in the CMS.
- No custom backend API server is required.
