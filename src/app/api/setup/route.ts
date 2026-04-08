import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    // Run prisma db push to create tables
    const result = execSync('npx prisma db push --skip-generate --accept-data-loss 2>&1', {
      timeout: 60000,
      encoding: 'utf-8',
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Schema pushed successfully',
      output: result 
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to push schema: ' + message 
    }, { status: 500 })
  }
}
