import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { streamText } from 'ai'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { question, graphData, documentSummaries } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 })
    }

    const graphContext = graphData ? `
Knowledge Graph Context:
- ${graphData.nodes?.length || 0} entities identified
- ${graphData.links?.length || 0} relationships mapped

Key Entities:
${graphData.nodes?.slice(0, 20).map((n: any) => 
  `- ${n.name} (${n.type}): ${n.description || 'No description'}`
).join('\n')}

Key Relationships:
${graphData.links?.slice(0, 20).map((l: any) => 
  `- ${l.source} ${l.type} ${l.target}`
).join('\n')}
` : 'No graph data available yet.'

    const prompt = `You are analyzing a knowledge graph extracted from documents. Answer the user's question based on the graph structure and relationships.

${graphContext}

Document Context:
${documentSummaries || 'Processing documents...'}

User Question: ${question}

Provide a clear, concise answer that:
1. References specific entities and relationships from the graph when relevant
2. Explains connections between concepts
3. Uses the graph structure to provide insights
4. Mentions if information is limited or unclear

Answer:`

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      stream: true,
    })

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Answer question error:', error)
    return NextResponse.json(
      { error: 'Failed to answer question', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}