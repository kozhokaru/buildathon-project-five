'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { DocumentUploader } from '@/components/document-uploader'
import { KnowledgeGraph } from '@/components/knowledge-graph'
import { EntityPanel } from '@/components/entity-panel'
import { QuestionInterface } from '@/components/question-interface'
import { GraphControls } from '@/components/graph-controls'
import { ProcessedDocument, processDocuments, chunkDocument } from '@/lib/document-processor'
import { buildGraph, deduplicateEntities, mergeRelationships, Entity, Relationship, GraphData, GraphNode } from '@/lib/graph-builder'
import { DEMO_DATASETS } from '@/lib/demo-data'
import { Card } from '@/components/ui/card'
import { Loader2, Network } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const graphRef = useRef<any>()
  
  const [documents, setDocuments] = useState<ProcessedDocument[]>([])
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [documentSummaries, setDocumentSummaries] = useState('')

  // Load demo data if specified in URL
  useEffect(() => {
    const demo = searchParams.get('demo')
    if (demo && DEMO_DATASETS[demo]) {
      loadDemoData(demo)
    }
  }, [searchParams])

  const loadDemoData = async (datasetId: string) => {
    const dataset = DEMO_DATASETS[datasetId]
    if (!dataset) return

    const demoDoc: ProcessedDocument = {
      id: `demo-${datasetId}`,
      name: `${dataset.name} (Demo)`,
      content: dataset.content,
      type: 'text',
      chunks: chunkDocument(dataset.content)
    }

    setDocuments([demoDoc])
    setDocumentSummaries(dataset.description)
    
    // Build graph directly from demo data
    const graph = buildGraph(dataset.entities, dataset.relationships)
    setGraphData(graph)
    
    toast({
      title: "Demo Loaded",
      description: `Loaded ${dataset.name} dataset with ${dataset.entities.length} entities`,
    })
  }

  const handleDocumentsProcessed = async (newDocuments: ProcessedDocument[]) => {
    console.log('Processing documents:', newDocuments)
    
    if (newDocuments.length === 0) {
      setDocuments([])
      setGraphData(null)
      return
    }

    // Check if this is demo data
    const isDemoData = newDocuments.some(doc => doc.id.startsWith('demo-'))
    
    setDocuments(newDocuments)
    setIsProcessing(true)

    try {
      // If demo data, use pre-defined entities
      if (isDemoData) {
        const dataset = DEMO_DATASETS['solar-system']
        const graph = buildGraph(dataset.entities, dataset.relationships)
        setGraphData(graph)
        setDocumentSummaries(dataset.description)
        
        toast({
          title: "Demo Loaded",
          description: `Loaded ${dataset.name} dataset with ${dataset.entities.length} entities`,
        })
        setIsProcessing(false)
        return
      }

      const processed = processDocuments(newDocuments)
      const allEntities: Entity[] = []
      const allRelationships: Relationship[] = []
      
      console.log('Processed documents:', processed)
      
      // Extract entities from each chunk
      for (const doc of processed.documents) {
        for (let i = 0; i < doc.chunks.length; i++) {
          const chunk = doc.chunks[i]
          
          console.log(`Processing chunk ${i + 1}/${doc.chunks.length}`)
          
          try {
            const response = await fetch('/api/extract-entities', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: chunk,
                chunkIndex: i + 1,
                totalChunks: doc.chunks.length
              })
            })

            if (response.ok) {
              const data = await response.json()
              console.log('Extracted entities:', data)
              
              if (data.warning) {
                console.warn('API Warning:', data.warning)
              }
              
              allEntities.push(...(data.entities || []))
              allRelationships.push(...(data.relationships || []))
            } else {
              console.error('API response not ok:', response.status)
            }
          } catch (error) {
            console.error('Error extracting entities from chunk:', error)
          }
        }
      }

      // Deduplicate and merge
      const uniqueEntities = deduplicateEntities(allEntities)
      const mergedRelationships = mergeRelationships(allRelationships)
      
      // Build graph
      const graph = buildGraph(uniqueEntities, mergedRelationships)
      setGraphData(graph)
      
      // Create document summary
      const summary = newDocuments.map(d => d.name).join(', ')
      setDocumentSummaries(`Processed ${newDocuments.length} documents: ${summary}`)
      
      toast({
        title: "Graph Built",
        description: `Created graph with ${graph.nodes.length} entities and ${graph.links.length} relationships`,
      })
    } catch (error) {
      console.error('Error processing documents:', error)
      toast({
        title: "Processing Error",
        description: "Failed to build knowledge graph. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node)
  }, [])

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(1.5, 200)
    }
  }

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(0.75, 200)
    }
  }

  const handleReset = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400)
    }
  }

  const handleCenter = () => {
    if (graphRef.current) {
      graphRef.current.centerAt(0, 0, 400)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] relative">
      {/* Header */}
      <div className="p-4 border-b">
        <DocumentUploader 
          onDocumentsProcessed={handleDocumentsProcessed}
          isProcessing={isProcessing}
        />
      </div>

      {/* Main Content - Add padding bottom for Q&A panel */}
      <div className="flex-1 flex overflow-hidden" style={{ paddingBottom: '180px' }}>
        {/* Graph Area */}
        <div className="flex-1 relative">
          {graphData ? (
            <>
              <KnowledgeGraph 
                graphData={graphData}
                onNodeClick={handleNodeClick}
                selectedNodeId={selectedNode?.id}
              />
              <GraphControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
                onCenter={handleCenter}
              />
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <Card className="p-8 text-center max-w-md">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">Building Knowledge Graph</h3>
                    <p className="text-sm text-muted-foreground">
                      Extracting entities and relationships from your documents...
                    </p>
                  </>
                ) : (
                  <>
                    <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Graph Yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload documents or load demo data to create your knowledge graph
                    </p>
                  </>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l p-4 overflow-y-auto">
          <EntityPanel
            selectedNode={selectedNode}
            graphData={graphData || { nodes: [], links: [] }}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      </div>

      {/* Q&A Interface */}
      <QuestionInterface 
        graphData={graphData}
        documentSummaries={documentSummaries}
      />
    </div>
  )
}