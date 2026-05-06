import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase.from('projects').select('id, updated_at').eq('published', true)

  const projectEntries = (data ?? []).map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    ...projectEntries
  ]
}
