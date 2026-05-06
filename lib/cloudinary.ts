export async function uploadToCloudinary(file: File, folder: 'project-images' | 'brochures'): Promise<string> {
  const maxSize = folder === 'brochures' ? 15 * 1024 * 1024 : 10 * 1024 * 1024
  const allowedTypes = folder === 'brochures'
    ? ['application/pdf']
    : ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

  if (file.size > maxSize) {
    throw new Error(folder === 'brochures' ? 'Brochure must be 15MB or smaller.' : 'Image must be 10MB or smaller.')
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(folder === 'brochures' ? 'Only PDF brochures are allowed.' : 'Only JPG, PNG, WEBP, or AVIF images are allowed.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
  formData.append('folder', folder)

  // PDFs should be uploaded as raw assets so the returned URL opens directly in browsers.
  const resourceType = folder === 'brochures' ? 'raw' : 'image'

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.error?.message || 'Cloudinary upload failed')
  }

  const data = await response.json()
  return data.secure_url as string
}
