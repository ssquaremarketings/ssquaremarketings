import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { existsSync } from 'fs'
import { join } from 'path'

const baseUrl = 'https://www.ssquaremarketings.com'

function toDate(value: string | null | undefined): Date {
  return value ? new Date(value) : new Date()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: projects } = await supabase
    .from('projects')
    .select('id, updated_at')
    .eq('published', true)
    .order('updated_at', { ascending: false })

  // Static pages section: include the core indexable routes that should always be crawled.
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    }
  ]

  const optionalPages: MetadataRoute.Sitemap = [
    existsSync(join(process.cwd(), 'app', 'about', 'page.tsx'))
      ? {
          url: `${baseUrl}/about`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6
        }
      : null,
    existsSync(join(process.cwd(), 'app', 'contact', 'page.tsx'))
      ? {
          url: `${baseUrl}/contact`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6
        }
      : null
  ].filter((page): page is NonNullable<typeof page> => page !== null)

  // Dynamic project URLs section: add each published project using the same route structure as the detail page.
  const projectEntries: MetadataRoute.Sitemap = (projects ?? []).map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: toDate(project.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  // SEO priorities: homepage highest, projects index next, and individual project pages slightly lower.
  return [...entries, ...optionalPages, ...projectEntries]
}
