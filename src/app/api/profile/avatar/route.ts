import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'
import { success, error, unauthorized } from '@/lib/api-response'
import { authenticate } from '@/lib/auth'
import { createId } from '@paralleldrive/cuid2'

const AVATAR_DIR = path.join(process.cwd(), 'public', 'avatars')

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return unauthorized()

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) return error('Image file is required')

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return error('Only JPEG, PNG, GIF, and WebP images are allowed')
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return error('File size must be less than 5MB')
    }

    // Ensure avatar directory exists
    await mkdir(AVATAR_DIR, { recursive: true })

    // Generate unique filename
    const ext = path.extname(file.name) || '.png'
    const uniqueName = `${createId()}${ext}`
    const filePath = path.join(AVATAR_DIR, uniqueName)

    // Write file to disk
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Update user avatar path
    const user = await db.user.update({
      where: { id: auth.user.id },
      data: { avatar: `/avatars/${uniqueName}` },
      select: { id: true, name: true, avatar: true },
    })

    return success({ user, avatarUrl: `/avatars/${uniqueName}` })
  } catch {
    return error('Internal server error', 500)
  }
}
