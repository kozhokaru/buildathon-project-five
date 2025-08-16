'use client'

import { GraphNode, GraphLink, GraphData } from '@/lib/graph-builder'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Network, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EntityPanelProps {
  selectedNode: GraphNode | null
  graphData: GraphData
  onClose: () => void
}

export function EntityPanel({ selectedNode, graphData, onClose }: EntityPanelProps) {
  if (!selectedNode) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Entity Details</CardTitle>
          <CardDescription>
            Click on a node to view its details and connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Network className="h-8 w-8 mb-2" />
            <p className="text-sm text-center">
              Select an entity from the graph to explore its relationships
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const relatedLinks = graphData.links.filter(
    link => link.source === selectedNode.id || link.target === selectedNode.id
  )

  const relatedNodes = new Map<string, { node: GraphNode; relationship: GraphLink }>()
  
  relatedLinks.forEach(link => {
    const relatedId = link.source === selectedNode.id ? link.target : link.source
    const relatedNode = graphData.nodes.find(n => n.id === relatedId)
    if (relatedNode) {
      relatedNodes.set(relatedId, { node: relatedNode, relationship: link })
    }
  })

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{selectedNode.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="capitalize">
                {selectedNode.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {relatedNodes.size} connections
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {selectedNode.description && (
          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm text-muted-foreground">
              {selectedNode.description}
            </p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-2">Related Entities</h4>
          <div className="space-y-2">
            {Array.from(relatedNodes.values()).map(({ node, relationship }) => {
              const isSource = relationship.source === selectedNode.id
              return (
                <div
                  key={node.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: node.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{node.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {isSource ? (
                        <>
                          <span>{relationship.type}</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-3 w-3 rotate-180" />
                          <span>{relationship.type}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {relatedNodes.size === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No connections found
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-1">Graph Statistics</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Node Size:</span>
              <span className="font-mono">{selectedNode.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Connections:</span>
              <span className="font-mono">{relatedLinks.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}