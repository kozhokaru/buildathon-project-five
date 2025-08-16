'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { GraphData, GraphNode, GraphLink } from '@/lib/graph-builder'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
})

interface KnowledgeGraphProps {
  graphData: GraphData
  onNodeClick?: (node: GraphNode) => void
  selectedNodeId?: string | null
}

export function KnowledgeGraph({ graphData, onNodeClick, selectedNodeId }: KnowledgeGraphProps) {
  const graphRef = useRef<any>()
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>())
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>())
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null)

  const handleNodeClick = useCallback((node: any) => {
    if (onNodeClick) {
      onNodeClick(node as GraphNode)
    }
  }, [onNodeClick])

  const handleNodeHover = useCallback((node: any) => {
    setHighlightNodes(new Set())
    setHighlightLinks(new Set())
    
    if (node) {
      const neighbors = new Set<string>()
      const links = new Set<string>()
      
      graphData.links.forEach(link => {
        if (link.source === node.id || (link.source as any).id === node.id) {
          neighbors.add(typeof link.target === 'string' ? link.target : (link.target as any).id)
          links.add(`${link.source}-${link.target}`)
        }
        if (link.target === node.id || (link.target as any).id === node.id) {
          neighbors.add(typeof link.source === 'string' ? link.source : (link.source as any).id)
          links.add(`${link.source}-${link.target}`)
        }
      })
      
      neighbors.add(node.id)
      setHighlightNodes(neighbors)
      setHighlightLinks(links)
      setHoverNode(node as GraphNode)
    } else {
      setHoverNode(null)
    }
  }, [graphData.links])

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const isHighlighted = highlightNodes.has(node.id)
    const isSelected = selectedNodeId === node.id
    const label = node.name
    const fontSize = 12 / globalScale
    ctx.font = `${fontSize}px Sans-Serif`
    
    // Node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI, false)
    
    if (isSelected) {
      ctx.fillStyle = node.color
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2 / globalScale
      ctx.fill()
      ctx.stroke()
      
      // Glow effect for selected node
      const gradient = ctx.createRadialGradient(node.x, node.y, node.size, node.x, node.y, node.size * 2)
      gradient.addColorStop(0, node.color + '40')
      gradient.addColorStop(1, node.color + '00')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.size * 2, 0, 2 * Math.PI, false)
      ctx.fill()
    } else if (isHighlighted) {
      ctx.fillStyle = node.color
      ctx.fill()
    } else {
      ctx.fillStyle = highlightNodes.size > 0 ? node.color + '30' : node.color
      ctx.fill()
    }
    
    // Label
    if (globalScale > 0.5 || isHighlighted || isSelected) {
      const textWidth = ctx.measureText(label).width
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2)
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.fillRect(
        node.x - bckgDimensions[0] / 2,
        node.y + node.size + 2,
        bckgDimensions[0],
        bckgDimensions[1]
      )
      
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = isHighlighted || isSelected ? '#000' : '#666'
      ctx.fillText(label, node.x, node.y + node.size + 2 + fontSize * 0.1)
    }
  }, [highlightNodes, selectedNodeId])

  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const start = link.source
    const end = link.target
    
    if (!start.x || !start.y || !end.x || !end.y) return
    
    const linkId = `${start.id}-${end.id}`
    const isHighlighted = highlightLinks.has(linkId) || highlightLinks.has(`${end.id}-${start.id}`)
    
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    
    if (isHighlighted) {
      ctx.strokeStyle = link.color.replace('0.3', '0.8')
      ctx.lineWidth = Math.max(1, link.value) * 1.5
    } else {
      ctx.strokeStyle = highlightLinks.size > 0 ? link.color.replace('0.3', '0.1') : link.color
      ctx.lineWidth = Math.max(1, link.value)
    }
    
    ctx.stroke()
  }, [highlightLinks])

  useEffect(() => {
    if (graphRef.current && selectedNodeId) {
      const node = graphData.nodes.find(n => n.id === selectedNodeId)
      if (node) {
        graphRef.current.centerAt(node.x, node.y, 500)
        graphRef.current.zoom(2, 500)
      }
    }
  }, [selectedNodeId, graphData.nodes])

  return (
    <div className="relative w-full h-full">
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeId="id"
        nodeLabel={() => ''}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => 'replace'}
        linkCanvasObject={paintLink}
        linkCanvasObjectMode={() => 'replace'}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        cooldownTicks={100}
        d3VelocityDecay={0.3}
        linkDirectionalParticles={0}
        enableZoomInteraction={true}
        enableNodeDrag={true}
        enablePanInteraction={true}
      />
      
      {hoverNode && (
        <div className="absolute top-4 left-4 bg-background/95 border rounded-lg p-3 max-w-xs pointer-events-none">
          <div className="font-semibold">{hoverNode.name}</div>
          <div className="text-xs text-muted-foreground capitalize">{hoverNode.type}</div>
          {hoverNode.description && (
            <div className="text-sm mt-1">{hoverNode.description}</div>
          )}
        </div>
      )}
    </div>
  )
}