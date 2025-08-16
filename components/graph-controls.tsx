'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ZoomIn, ZoomOut, Maximize2, RefreshCw } from 'lucide-react'

interface GraphControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  onCenter: () => void
}

export function GraphControls({ onZoomIn, onZoomOut, onReset, onCenter }: GraphControlsProps) {
  return (
    <Card className="absolute bottom-4 left-4 p-2 flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onZoomIn}
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onZoomOut}
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onCenter}
        title="Center Graph"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onReset}
        title="Reset View"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </Card>
  )
}