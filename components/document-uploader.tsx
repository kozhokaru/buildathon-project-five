'use client'

import { useState, useCallback } from 'react'
import { Upload, Link, FileText, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { extractTextFromFile, ProcessedDocument } from '@/lib/document-processor'

interface DocumentUploaderProps {
  onDocumentsProcessed: (documents: ProcessedDocument[]) => void
  isProcessing?: boolean
}

export function DocumentUploader({ onDocumentsProcessed, isProcessing }: DocumentUploaderProps) {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    const files = Array.from(e.dataTransfer.files)
    await processFiles(files)
  }, [])

  const processFiles = async (files: File[]) => {
    console.log('Processing files:', files)
    
    const validFiles = files.filter(file => 
      file.type === 'text/plain' || 
      file.type === 'text/markdown' ||
      file.type === 'application/pdf' ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md')
    )

    if (validFiles.length === 0) {
      setError('Please upload TXT, MD, or PDF files')
      return
    }

    const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0)
    if (totalSize > 100 * 1024 * 1024) {
      setError('Total file size exceeds 100MB limit')
      return
    }

    const newDocs: ProcessedDocument[] = []
    
    for (const file of validFiles) {
      try {
        console.log(`Extracting text from ${file.name}`)
        const content = await extractTextFromFile(file)
        console.log(`Extracted ${content.length} characters from ${file.name}`)
        
        if (!content || content.trim().length === 0) {
          setError(`File ${file.name} appears to be empty`)
          continue
        }
        
        newDocs.push({
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          content,
          type: 'file',
          chunks: []
        })
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err)
        setError(`Failed to process ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    if (newDocs.length > 0) {
      const updatedDocs = [...documents, ...newDocs]
      setDocuments(updatedDocs)
      console.log('Calling onDocumentsProcessed with:', updatedDocs)
      onDocumentsProcessed(updatedDocs)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const files = Array.from(e.target.files || [])
    await processFiles(files)
  }

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return
    setError(null)

    const urls = urlInput.split(',').map(url => url.trim()).filter(Boolean)
    
    try {
      const responses = await Promise.all(
        urls.map(url => fetch('/api/fetch-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        }))
      )

      const newDocs: ProcessedDocument[] = []
      
      for (let i = 0; i < responses.length; i++) {
        const response = responses[i]
        if (response.ok) {
          const { content, title } = await response.json()
          newDocs.push({
            id: `url-${Date.now()}-${i}`,
            name: title || urls[i],
            content,
            type: 'url',
            chunks: []
          })
        } else {
          setError(`Failed to fetch ${urls[i]}`)
        }
      }

      const updatedDocs = [...documents, ...newDocs]
      setDocuments(updatedDocs)
      onDocumentsProcessed(updatedDocs)
      setUrlInput('')
    } catch (err) {
      setError('Failed to fetch URL content')
      console.error(err)
    }
  }

  const removeDocument = (id: string) => {
    const updatedDocs = documents.filter(doc => doc.id !== id)
    setDocuments(updatedDocs)
    onDocumentsProcessed(updatedDocs)
  }

  const loadDemoData = async () => {
    setError(null)
    try {
      const response = await fetch('/api/demo-data?dataset=solar-system')
      if (response.ok) {
        const { content, entities, relationships } = await response.json()
        const demoDoc: ProcessedDocument = {
          id: 'demo-solar-system',
          name: 'Solar System (Demo)',
          content,
          type: 'text',
          chunks: []
        }
        const updatedDocs = [...documents, demoDoc]
        setDocuments(updatedDocs)
        onDocumentsProcessed(updatedDocs)
      }
    } catch (err) {
      setError('Failed to load demo data')
      console.error(err)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-2">
            Drag & drop files here, or click to select
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Supports TXT, MD, PDF (max 100MB total)
          </p>
          <input
            type="file"
            multiple
            accept=".txt,.md,.pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
          <label htmlFor="file-upload">
            <Button variant="outline" asChild disabled={isProcessing}>
              <span>Select Files</span>
            </Button>
          </label>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Enter URLs (comma-separated)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={isProcessing}
            onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <Button 
            onClick={handleUrlSubmit} 
            disabled={!urlInput.trim() || isProcessing}
            size="icon"
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center">
          <Button 
            variant="secondary" 
            onClick={loadDemoData}
            disabled={isProcessing}
          >
            Load Demo: Solar System
          </Button>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}

        {documents.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Loaded Documents:</p>
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm truncate max-w-[200px]">{doc.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({Math.round(doc.content.length / 1000)}k chars)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeDocument(doc.id)}
                  disabled={isProcessing}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing documents...
          </div>
        )}
      </div>
    </Card>
  )
}