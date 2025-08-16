import { NextRequest, NextResponse } from 'next/server'
import { DEMO_DATASETS } from '@/lib/demo-data'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dataset = searchParams.get('dataset')

  if (!dataset || !DEMO_DATASETS[dataset]) {
    return NextResponse.json(
      { error: 'Invalid dataset' },
      { status: 400 }
    )
  }

  const data = DEMO_DATASETS[dataset]
  
  return NextResponse.json({
    content: data.content,
    entities: data.entities,
    relationships: data.relationships,
    name: data.name,
    description: data.description
  })
}