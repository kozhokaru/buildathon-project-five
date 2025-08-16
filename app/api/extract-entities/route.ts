import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const { text, chunkIndex, totalChunks } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured')
      // Return mock data for testing
      return NextResponse.json({
        entities: [
          { id: 'entity-1', name: 'Sample Entity', type: 'concept', importance: 0.8 },
          { id: 'entity-2', name: 'Another Entity', type: 'concept', importance: 0.6 }
        ],
        relationships: [
          { source: 'entity-1', target: 'entity-2', type: 'relates-to', strength: 0.7 }
        ],
        warning: 'Using mock data - ANTHROPIC_API_KEY not configured'
      })
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const prompt = `Extract key concepts, entities, and their relationships from this text.
    
Output a JSON object with:
- entities: Array of objects with {id, name, type, description, importance}
  - id: unique identifier (lowercase, hyphenated)
  - name: display name
  - type: one of "concept", "person", "place", "event", "organization", "technology", "other"
  - description: brief description (optional, max 50 chars)
  - importance: 0-1 score based on significance
- relationships: Array of objects with {source, target, type, strength}
  - source/target: entity ids
  - type: relationship type (e.g., "relates-to", "part-of", "created-by", etc.)
  - strength: 0-1 score

Focus on the most important concepts, people, places, events, and ideas.
Be selective - aim for 5-15 entities and 5-20 relationships per chunk.

Text (chunk ${chunkIndex}/${totalChunks}):
${text}

Return only valid JSON, no additional text.`

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    try {
      const extracted = JSON.parse(content.text)
      return NextResponse.json(extracted)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text)
      
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0])
          return NextResponse.json(extracted)
        } catch {
          return NextResponse.json({ 
            entities: [], 
            relationships: [],
            error: 'Failed to parse response' 
          })
        }
      }
      
      return NextResponse.json({ 
        entities: [], 
        relationships: [],
        error: 'Failed to parse response' 
      })
    }
  } catch (error) {
    console.error('Entity extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract entities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}