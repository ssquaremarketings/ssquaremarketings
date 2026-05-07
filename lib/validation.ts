import { z } from 'zod'

export const projectTagValues = ['available', 'hot-deal', 'featured'] as const
export const projectTypeValues = ['houses', 'apartments', 'agriculture-land', 'commercial-space', 'open-plots', 'our-ventures'] as const
export const videoStatusValues = ['none', 'uploading', 'processing', 'ready', 'error'] as const

const remoteUrl = z.string().url().max(2048)
const optionalText = z.union([z.string().trim().max(5000), z.null()]).optional()

export const projectCreateSchema = z.object({
  name: z.string().trim().min(2).max(160),
  tag: z.enum(projectTagValues),
  type: z.enum(projectTypeValues),
  location: z.string().trim().min(2).max(200),
  price: z.string().trim().min(1).max(100),
  price_per_sqyd: optionalText,
  area: optionalText,
  description: optionalText,
  image_url: z.union([remoteUrl, z.null()]).optional(),
  image_urls: z.array(remoteUrl).max(20).optional(),
  brochure_url: z.union([remoteUrl, z.null()]).optional(),
  published: z.boolean().optional(),
  mux_asset_id: z.union([z.string().trim().min(1).max(200), z.null()]).optional(),
  mux_playback_id: z.union([z.string().trim().min(1).max(200), z.null()]).optional(),
  video_status: z.enum(videoStatusValues).optional(),
  updated_at: z.string().datetime().optional()
}).strict()

export const projectUpdateSchema = projectCreateSchema.partial().superRefine((value, ctx) => {
  if (Object.keys(value).length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'At least one field is required' })
  }
})

export const uploadIdSchema = z.string().trim().min(1).max(200)
export const assetIdSchema = z.string().trim().min(1).max(200)

export const phoneSchema = z.string().trim().regex(/^[0-9+()\-\s]{7,20}$/, 'Invalid phone number')

export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: phoneSchema,
  budget: z.string().trim().min(1).max(100),
  message: z.string().trim().max(5000).optional().nullable(),
  property: z.string().trim().min(1).max(160),
}).strict()

export const contactLeadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  email: z.string().trim().email().max(160).optional().nullable(),
  subject: z.enum(['General Inquiry', 'Plot Inquiry', 'Site Visit']),
  message: z.string().trim().max(5000).optional().nullable(),
}).strict()

export const reviewSchema = z.object({
  reviewer_name: z.string().trim().min(2).max(120),
  phone: phoneSchema.optional().nullable(),
  property: z.string().trim().max(160).optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().trim().min(1).max(5000),
}).strict()
