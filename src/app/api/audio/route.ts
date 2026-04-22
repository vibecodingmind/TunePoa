import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'
import { createId } from '@paralleldrive/cuid2'

const UPLOAD_DIR = path.join(process.cwd(), 'upload', 'audio')

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return unauthorized()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (!isAdmin(auth.user.role)) {
      where.userId = auth.user.id
    }

    if (category) where.category = category
    if (status) where.status = status

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const tracks = await db.audioTrack.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, businessName: true },
        },
      },
    })

    return success({ tracks })
  } catch {
    return error('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return unauthorized()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const category = (formData.get('category') as string) || 'ringback'
    const isDefault = formData.get('isDefault') === 'true'

    if (!file) return error('Audio file is required')
    if (!title?.trim()) return error('Title is required')

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      return error('Only audio files are allowed')
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return error('File size must be less than 50MB')
    }

    // Ensure upload directory exists
    await mkdir(UPLOAD_DIR, { recursive: true })

    // Generate unique filename
    const ext = path.extname(file.name) || '.mp3'
    const uniqueName = `${createId()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const filePath = path.join(UPLOAD_DIR, uniqueName)

    // Write file to disk
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Create audio track record
    const track = await db.audioTrack.create({
      data: {
        userId: auth.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        fileName: file.name,
        filePath: `upload/audio/${uniqueName}`,
        fileSize: file.size,
        mimeType: file.type,
        category,
        isDefault,
        status: 'PROCESSING',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    // Simulate processing - set to active after "processing"
    // In a real app, this would be done via a webhook or queue
    setTimeout(async () => {
      try {
        await db.audioTrack.update({
          where: { id: track.id },
          data: { status: 'ACTIVE' },
        })
      } catch {
        // Ignore errors in background processing
      }
    }, 3000)

    return success({ track }, 201)
  } catch {
    return error('Internal server error', 500)
  }
}
