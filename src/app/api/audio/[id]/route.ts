import { NextRequest } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'
import { success, error, unauthorized, forbidden } from '@/lib/api-response'
import { authenticate, isAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return unauthorized()

    const track = await db.audioTrack.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, businessName: true },
        },
      },
    })

    if (!track) return error('Audio track not found', 404)

    // Users can only view their own tracks, admins can view all
    if (track.userId !== auth.user.id && !isAdmin(auth.user.role)) {
      return forbidden()
    }

    return success({ track })
  } catch {
    return error('Internal server error', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return unauthorized()

    const existing = await db.audioTrack.findUnique({ where: { id } })
    if (!existing) return error('Audio track not found', 404)

    // Users can only update their own tracks, admins can update all
    if (existing.userId !== auth.user.id && !isAdmin(auth.user.role)) {
      return forbidden()
    }

    const body = await request.json()
    const updateData: Record<string, unknown> = {}

    const allowedFields = ['title', 'description', 'category', 'status', 'isDefault']
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Status changes require admin
        if (field === 'status' && !isAdmin(auth.user.role)) {
          return forbidden('Only admins can change track status')
        }
        updateData[field] = body[field]
      }
    }

    const track = await db.audioTrack.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return success({ track })
  } catch {
    return error('Internal server error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await authenticate(request)
    if (!auth.authenticated || !auth.user) return unauthorized()

    const existing = await db.audioTrack.findUnique({ where: { id } })
    if (!existing) return error('Audio track not found', 404)

    // Users can only delete their own tracks, admins can delete all
    if (existing.userId !== auth.user.id && !isAdmin(auth.user.role)) {
      return forbidden()
    }

    // Try to delete the file from disk (ignore errors)
    try {
      const fullPath = path.join(process.cwd(), existing.filePath)
      await unlink(fullPath)
    } catch {
      // File may not exist — continue with DB deletion
    }

    await db.audioTrack.delete({ where: { id } })

    return success({ message: 'Audio track deleted successfully' })
  } catch {
    return error('Internal server error', 500)
  }
}
