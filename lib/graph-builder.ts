export interface Entity {
  id: string
  name: string
  type: 'concept' | 'person' | 'place' | 'event' | 'organization' | 'technology' | 'other'
  description?: string
  importance: number
}

export interface Relationship {
  source: string
  target: string
  type: string
  strength: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export interface GraphNode {
  id: string
  name: string
  type: string
  size: number
  color: string
  description?: string
}

export interface GraphLink {
  source: string
  target: string
  type: string
  value: number
  color?: string
}

export const NODE_COLORS: Record<string, string> = {
  concept: '#3B82F6',      // blue
  person: '#10B981',       // green
  place: '#F59E0B',        // orange
  event: '#EC4899',        // pink
  organization: '#8B5CF6', // purple
  technology: '#06B6D4',   // cyan
  other: '#6B7280'         // gray
}

export function buildGraph(entities: Entity[], relationships: Relationship[]): GraphData {
  const connectionCount: Record<string, number> = {}
  
  relationships.forEach(rel => {
    connectionCount[rel.source] = (connectionCount[rel.source] || 0) + 1
    connectionCount[rel.target] = (connectionCount[rel.target] || 0) + 1
  })
  
  const nodes: GraphNode[] = entities.map(entity => ({
    id: entity.id,
    name: entity.name,
    type: entity.type,
    size: Math.max(5, Math.min(20, (connectionCount[entity.id] || 0) * 2 + entity.importance * 5)),
    color: NODE_COLORS[entity.type] || NODE_COLORS.other,
    description: entity.description
  }))
  
  const links: GraphLink[] = relationships
    .filter(rel => rel.strength >= 0.3)
    .map(rel => ({
      source: rel.source,
      target: rel.target,
      type: rel.type,
      value: rel.strength * 2,
      color: 'rgba(156, 163, 175, 0.3)'
    }))
  
  return { nodes, links }
}

export function deduplicateEntities(entities: Entity[]): Entity[] {
  const seen = new Map<string, Entity>()
  
  entities.forEach(entity => {
    const key = entity.name.toLowerCase()
    if (!seen.has(key) || entity.importance > seen.get(key)!.importance) {
      seen.set(key, entity)
    }
  })
  
  return Array.from(seen.values())
}

export function mergeRelationships(relationships: Relationship[]): Relationship[] {
  const merged = new Map<string, Relationship>()
  
  relationships.forEach(rel => {
    const key = `${rel.source}-${rel.target}-${rel.type}`
    const reverseKey = `${rel.target}-${rel.source}-${rel.type}`
    
    if (merged.has(key)) {
      const existing = merged.get(key)!
      existing.strength = Math.max(existing.strength, rel.strength)
    } else if (merged.has(reverseKey)) {
      const existing = merged.get(reverseKey)!
      existing.strength = Math.max(existing.strength, rel.strength)
    } else {
      merged.set(key, { ...rel })
    }
  })
  
  return Array.from(merged.values())
}