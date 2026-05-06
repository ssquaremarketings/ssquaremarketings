import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Project } from '@/lib/types'
import { SAMPLE_PROJECTS } from '@/lib/sample-data'
import { Navbar } from '@/components/visitor/Navbar'
import { HeroSection } from '@/components/visitor/HeroSection'
import { AboutSection } from '@/components/visitor/AboutSection'
import { ProjectsSection } from '@/components/visitor/ProjectsSection'
import { ValuesSection } from '@/components/visitor/ValuesSection'
import { TestimonialsSection } from '@/components/visitor/TestimonialsSection'
import { ContactSection } from '@/components/visitor/ContactSection'
import { Footer } from '@/components/visitor/Footer'
import Script from 'next/script'

export const revalidate = 60

async function getProjects(): Promise<Project[]> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) {
    return SAMPLE_PROJECTS.map((project, index) => ({
      ...project,
      id: `sample-${index + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  }

  if (!data || data.length === 0) {
    return SAMPLE_PROJECTS.map((project, index) => ({
      ...project,
      id: `sample-${index + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  }

  return data as Project[]
}

export default async function HomePage() {
  const projects = await getProjects()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'S-Square Marketings',
    url: baseUrl,
    logo: `${baseUrl}/branding.png`
  }

  return (
    <main>
      <Script id="organization-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(structuredData)}
      </Script>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ProjectsSection projects={projects} />
      <ValuesSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
