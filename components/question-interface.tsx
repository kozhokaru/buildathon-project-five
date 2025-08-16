'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, Loader2, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react'
import { GraphData } from '@/lib/graph-builder'

interface QuestionInterfaceProps {
  graphData: GraphData | null
  documentSummaries?: string
}

const EXAMPLE_QUESTIONS = [
  "How are X and Y related?",
  "What is the most connected entity?",
  "Explain the main concepts",
  "What missions explored Mars?",
  "Who discovered these moons?"
]

export function QuestionInterface({ graphData, documentSummaries }: QuestionInterfaceProps) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [streamedAnswer, setStreamedAnswer] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!question.trim() || isLoading) return

    setIsLoading(true)
    setAnswer('')
    setStreamedAnswer('')
    setIsExpanded(true)

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/answer-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          graphData,
          documentSummaries
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error('Failed to get answer')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let fullAnswer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          fullAnswer += chunk
          setStreamedAnswer(fullAnswer)
        }
        setAnswer(fullAnswer)
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error:', error)
        setAnswer('Failed to get answer. Please try again.')
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleExampleClick = (example: string) => {
    if (graphData && example.includes('Mars')) {
      setQuestion("What missions have explored Mars?")
    } else if (graphData && example.includes('discovered')) {
      setQuestion("Who discovered the moons of Jupiter?")
    } else if (example.includes('most connected')) {
      setQuestion("What is the most connected entity in the graph?")
    } else if (example.includes('main concepts')) {
      setQuestion("What are the main concepts in this knowledge graph?")
    } else {
      setQuestion(example)
    }
  }

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-30 border-t lg:left-64">
      <div className="w-full px-4 lg:px-6">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">Ask about the graph</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>

          {!isExpanded && (
            <div className="flex gap-2 mb-3">
              {EXAMPLE_QUESTIONS.slice(0, 3).map((example, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder={graphData ? "Ask a question about the knowledge graph..." : "Load documents first to ask questions"}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={!graphData || isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!graphData || !question.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          {isExpanded && (
            <div className="mt-4 space-y-3">
              {!isExpanded && (
                <div className="flex gap-2 flex-wrap">
                  {EXAMPLE_QUESTIONS.map((example, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => handleExampleClick(example)}
                    >
                      {example}
                    </Badge>
                  ))}
                </div>
              )}

              {(streamedAnswer || answer) && (
                <div className="bg-muted/50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="text-sm whitespace-pre-wrap">
                    {streamedAnswer || answer}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}