import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    // Step 1: Run prisma db push to create/update tables
    const pushResult = execSync('npx prisma db push --skip-generate --accept-data-loss', {
      timeout: 60000,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Schema pushed successfully',
      output: pushResult 
    })
  } catch (err: unknown) {
    let message = ''
    if (err && typeof err === 'object' && 'stdout' in err) {
      message = 'STDOUT: ' + String((err as {stdout: unknown}).stdout) + '\nSTDERR: ' + String((err as {stderr: unknown}).stderr)
    } else {
      message = err instanceof Error ? err.message : String(err)
    }
    return NextResponse.json({ 
      success: false, 
      error: message 
    }, { status: 500 })
  }
}
