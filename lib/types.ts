export type ProjectTag = 'available' | 'hot-deal' | 'featured'
export type LeadStatus = 'new' | 'called' | 'visited' | 'closed'

export interface Project {
  id: string
  name: string
  tag: ProjectTag
  location: string
  price: string
  price_per_sqyd?: string | null
  area?: string | null
  description?: string | null
  image_url?: string | null
  image_urls?: string[] // <-- add this line
  brochure_url?: string | null
  published: boolean
  created_at: string
  updated_at: string
  // --- Mux video fields ---
  mux_asset_id?: string
  mux_playback_id?: string
  video_status?: 'none' | 'uploading' | 'processing' | 'ready' | 'error'
  // --- Project type ---
  type: 'houses' | 'apartments' | 'agriculture-land' | 'commercial-space' | 'open-plots' | 'our-ventures'
}
// Project type constants
export const PROJECT_TYPES = [
  { value: 'houses',            label: 'Houses',             icon: '🏠', color: 'bg-orange-100 text-orange-800' },
  { value: 'apartments',        label: 'Apartments & Flats', icon: '🏢', color: 'bg-blue-100 text-blue-800'   },
  { value: 'agriculture-land',  label: 'Agriculture Land',   icon: '🌾', color: 'bg-green-100 text-green-800' },
  { value: 'commercial-space',  label: 'Commercial Space',   icon: '🏪', color: 'bg-purple-100 text-purple-800'},
  { value: 'open-plots',        label: 'Open Plots',         icon: '📐', color: 'bg-amber-100 text-amber-800' },
  { value: 'our-ventures',      label: 'Our Ventures',       icon: '🏗️', color: 'bg-teal-100 text-teal-800'  },
] as const
// Review interface
export interface Review {
  id: string
  reviewer_name: string
  phone?: string
  property?: string
  project_id?: string
  rating: number
  review_text: string
  approved: boolean
  featured: boolean
  created_at: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  budget?: string | null
  property?: string | null
  message?: string | null
  status: LeadStatus
  created_at: string
}
