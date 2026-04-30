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

    // Add unique suffix to prevent overwrites
    const ext = safeName.includes('.') ? '.' + safeName.split('.').pop() : ''
    const baseName = safeName.includes('.') ? safeName.slice(0, safeName.lastIndexOf('.')) : safeName
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const uniqueName = `${baseName}-${uniqueSuffix}${ext}`

    // Build upload path
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadsDir, { recursive: true })

    const filePath = join(uploadsDir, uniqueName)

    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    return success({
      url: `/uploads/${uniqueName}`,
      name: uniqueName,
      size: file.size,
      type: file.type,
    }, 201)
  } catch {
    return error('Internal server error', 500)
  }
}
