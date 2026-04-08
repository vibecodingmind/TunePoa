import { NextRequest } from 'next/server'
import { success } from '@/lib/api-response'

export async function GET() {
  return success({ message: 'TunePoa API v1.0', version: '1.0.0' })
}
