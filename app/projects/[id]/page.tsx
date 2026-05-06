import { createSupabaseServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import MediaGallery from '@/components/visitor/MediaGallery'
import MuxPlayer from '@mux/mux-player-react'
import EnquiryModal from '@/components/visitor/EnquiryModal'
import { PROJECT_TYPES } from '@/lib/types'
import StarRating from '@/components/visitor/StarRating'
import ReviewCard from '@/components/visitor/ReviewCard'
import ReviewForm from '@/components/visitor/ReviewForm'
import type { Metadata } from 'next'
import Script from 'next/script'

async function getProject(id: string) {
  const supabase = createSupabaseServerClient()
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('published', true)
    .single()

  return project
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const project = await getProject(params.id)

  if (!project) {
    return { title: 'Project Not Found' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return {
    title: project.name,
    description: project.description || `${project.name} in ${project.location}`,
    alternates: {
      canonical: `/projects/${project.id}`
    },
    openGraph: {
      title: project.name,
      description: project.description || `${project.name} in ${project.location}`,
      url: `${baseUrl}/projects/${project.id}`,
      images: project.image_url ? [{ url: project.image_url, width: 1200, height: 630, alt: project.name }] : []
    }
  }
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)

  if (!project) return notFound()

  const supabase = createSupabaseServerClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '+91-XXXXXXXXXX'
  const telHref = `tel:${contactPhone}`
  const waHref = `https://wa.me/${contactPhone.replace(/\D/g, '')}`

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('project_id', params.id)
    .eq('approved', true)
    .order('created_at', { ascending: false })

  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const typeInfo = PROJECT_TYPES.find((t) => t.value === project.type)

  return (
    <main className="max-w-5xl mx-auto py-8 px-4">
      <Script id="project-breadcrumb-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
            { '@type': 'ListItem', position: 2, name: 'Projects', item: `${baseUrl}/#projects` },
            { '@type': 'ListItem', position: 3, name: project.name, item: `${baseUrl}/projects/${project.id}` }
          ]
        })}
      </Script>
      <Script id="project-listing-schema" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'RealEstateListing',
          name: project.name,
          description: project.description || `${project.name} in ${project.location}`,
          url: `${baseUrl}/projects/${project.id}`,
          image: project.image_url ? [project.image_url] : [],
          address: {
            '@type': 'PostalAddress',
            addressLocality: project.location
          },
          offers: {
            '@type': 'Offer',
            price: project.price,
            priceCurrency: 'INR'
          }
        })}
      </Script>
      <a
        href="/"
        className="inline-block mb-6 px-5 py-2 rounded-xl bg-[#1a3c5e] text-white font-semibold hover:bg-[#163251] transition-colors shadow"
      >
        ← Back to Home
      </a>
      {/* Media Gallery */}
      <MediaGallery project={project} />

      {/* Two columns */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* LEFT: Description, Video, Location, Brochure */}
        <div className="flex-1 min-w-0">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-[#1a3c5e] mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
          </section>

          {/* Video Tour */}
          {project.mux_playback_id && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-[#1a3c5e] mb-4">Video Tour</h2>
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <MuxPlayer
                  playbackId={project.mux_playback_id}
                  style={{ width: '100%', aspectRatio: '16/9' }}
                  autoPlay
                  muted
                  loop
                  playsInline
                  accentColor="#e8a020"
                />
              </div>
            </section>
          )}

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#1a3c5e] mb-2">Location</h2>
            <p className="text-gray-700">{project.location}</p>
          </section>

          {project.brochure_url && (
            <a
              href={project.brochure_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#1a3c5e] text-white px-6 py-2 rounded-xl font-semibold hover:bg-[#163251] transition-colors mb-8"
            >
              Download Brochure
            </a>
          )}
        </div>

        {/* RIGHT: Price, Enquire, Call, WhatsApp */}
        <aside className="w-full md:w-80 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl shadow p-6 mb-8">
            <div className="text-3xl font-bold text-[#1a3c5e] mb-2">{project.price}</div>
            {(project.price_per_sqyd || project.area) && (
              <div className="text-sm text-gray-500 mb-2">
                {project.price_per_sqyd}
                {project.price_per_sqyd && project.area ? ' · ' : ''}
                {project.area}
              </div>
            )}
            <EnquiryModal project={project}>
              <button className="w-full block text-center bg-amber-500 text-primary py-3 rounded-xl font-semibold mt-4 mb-2 hover:bg-amber-600 transition-colors">
                Enquire Now
              </button>
            </EnquiryModal>
            <a href={telHref} className="block w-full text-center py-2 rounded-xl border border-[#1a3c5e] text-[#1a3c5e] text-sm font-medium hover:bg-[#1a3c5e] hover:text-white transition-colors mb-2">
              Call
            </a>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2 rounded-xl border border-green-600 text-green-700 text-sm font-medium hover:bg-green-600 hover:text-white transition-colors">
              WhatsApp
            </a>
          </div>
        </aside>
      </div>

      {/* Contact/Enquiry Section */}
      <section id="contact" className="mt-12">
        {/* You can add your enquiry/contact form here, or import an EnquiryModal/ContactSection component */}
      </section>

      {/* Reviews Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-[#1a3c5e] mb-6">
          Buyer Reviews {reviews?.length ? `(${reviews.length})` : ''}
        </h2>

        {/* Rating summary bar */}
        {avgRating && (
          <div className="bg-white rounded-2xl border p-6 mb-6 flex items-center gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#1a3c5e]">{avgRating}</div>
              <StarRating value={Math.round(Number(avgRating))} readonly size="md" />
              <p className="text-sm text-gray-500 mt-1">{reviews!.length} reviews</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews!.filter((r) => r.rating === star).length
                const pct = reviews!.length ? Math.round((count / reviews!.length) * 100) : 0
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="w-6 text-gray-600">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-amber-400 h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-6 text-gray-500 text-xs">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews grid */}
        {reviews?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
        ) : (
          <p className="text-gray-500 mb-8">
            No reviews yet for this project. Be the first!
          </p>
        )}

        {/* Submit review form */}
        <ReviewForm projectId={params.id} projectName={project.name} />
      </section>
    </main>
  )
}
