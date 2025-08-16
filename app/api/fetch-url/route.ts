import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    // For now, let's just fetch the raw HTML and extract text
    // This is a simpler approach that avoids JSDOM issues
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GraphMind/1.0)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    
    // Simple text extraction - remove HTML tags
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 50000) // Limit to 50k chars

    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1] : new URL(url).hostname

    return NextResponse.json({
      content: textContent,
      title: title,
      excerpt: textContent.substring(0, 200)
    })
  } catch (error) {
    console.error('URL fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch URL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}