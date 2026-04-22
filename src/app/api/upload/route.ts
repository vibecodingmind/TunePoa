import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { success, error, unauthorized } from '@/lib/api-response'
import { authenticate } from '@/lib/auth'

// ---------------------------------------------------------------------------
// POST  –  generic file upload
// Saves the file to /public/uploads/ and returns the URL path.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) {
      return unauthorized()
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return error('No file provided')
    }

    // Limit file size to 5 MB
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return error('File size must be under 5 MB')
    }

    // Allowed MIME types (images, audio, common docs)
    const ALLOWED_TYPES = [
      'image/png',
      'image/jpeg',
      'image/gif',
      'image/svg+xml',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'application/pdf',
    ]

    if (!ALLOWED_TYPES.includes(file.type)) {
      return error(`File type "${file.type}" is not allowed`)
    }

    // Sanitise file name
    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')

    // Build upload path
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    const filePath = join(uploadsDir, safeName)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    return success({
      url: `/uploads/${safeName}`,
      name: safeName,
      size: file.size,
      type: file.type,
    }, 201)
  } catch {
    return error('Internal server error', 500)
  }
}
