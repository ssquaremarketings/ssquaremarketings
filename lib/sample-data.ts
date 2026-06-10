import type { Lead, Project } from '@/lib/types'

type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>
type LeadInsert = Omit<Lead, 'id' | 'created_at' | 'status'> & { status?: Lead['status'] }

export const SAMPLE_PROJECTS: ProjectInsert[] = [
  {
    name: 'Jagathi Homes',
    tag: 'available',
    type: 'house-plot',
    location: 'Uppagu, Pottipadu Road, Proddatur',
    price: 'Rs18 Lakhs onwards',
    price_per_sqyd: '4500',
    area: '150',
    description: 'A fast-growing residential plotting venture with excellent access roads and legal clarity.',
    image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
    brochure_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    published: true
  },
  {
    name: 'Vivanta Enclave',
    tag: 'featured',
    type: 'open-plots',
    location: 'Proddatur, Kadapa District',
    price: 'Rs22 Lakhs onwards',
    price_per_sqyd: '5200',
    area: '200',
    description: 'Premium featured community with planned amenities and high appreciation potential.',
    image_url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
    brochure_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    published: true
  },
  {
    name: 'CMR Rainbow',
    tag: 'hot-deal',
    type: 'open-plots',
    location: 'Chennamraju Palle, Proddatur-Duvvur Highway',
    price: 'Rs12 Lakhs onwards',
    price_per_sqyd: '3200',
    area: '100',
    description: 'A value-focused hot-deal project with quick connectivity to the highway corridor.',
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    brochure_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    published: true
  },
  {
    name: 'Mudra Valley',
    tag: 'hot-deal',
    type: 'open-plots',
    location: 'Beside Chandamama Venture, Proddatur',
    price: 'Rs10 Lakhs onwards',
    price_per_sqyd: '2900',
    area: '100',
    description: 'Budget-friendly plots ideal for first-time buyers and long-term investors.',
    image_url: 'https://images.unsplash.com/photo-1560448075-bb4caa6f4d1f?auto=format&fit=crop&w=1200&q=80',
    brochure_url: null,
    published: true
  }
]

export const SAMPLE_LEADS: LeadInsert[] = [
  {
    name: 'Praveen Kumar',
    phone: '9876543210',
    budget: 'Rs15-25 Lakhs',
    property: 'Jagathi Homes',
    message: 'Need weekend site visit slots.',
    status: 'new'
  },
  {
    name: 'Sneha Reddy',
    phone: '9123456789',
    budget: 'Rs10-15 Lakhs',
    property: 'CMR Rainbow',
    message: 'Please share legal approvals and final plot map.',
    status: 'called'
  },
  {
    name: 'Mahesh Babu',
    phone: '9988776655',
    budget: 'Rs25-50 Lakhs',
    property: 'Vivanta Enclave',
    message: 'Interested in corner plot options.',
    status: 'visited'
  }
]
