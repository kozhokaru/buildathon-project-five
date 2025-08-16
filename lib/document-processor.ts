export interface ProcessedDocument {
  id: string
  name: string
  content: string
  type: 'file' | 'url' | 'text'
  chunks: string[]
}

export function chunkDocument(text: string, maxTokens: number = 2000): string[] {
  const estimatedCharsPerToken = 4
  const maxChars = maxTokens * estimatedCharsPerToken
  
  const paragraphs = text.split(/\n\n+/)
  const chunks: string[] = []
  let currentChunk = ''
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
      }
      currentChunk = paragraph
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamically import PDF.js to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist')
    
    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    let fullText = ''
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
      fullText += pageText + '\n\n'
    }
    
    return fullText.trim()
  } catch (error) {
    console.error('Error parsing PDF:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return extractTextFromPDF(file)
  }
  
  return file.text()
}

export function processDocuments(documents: ProcessedDocument[]): {
  totalChunks: number
  totalCharacters: number
  documents: ProcessedDocument[]
} {
  let totalChunks = 0
  let totalCharacters = 0
  
  for (const doc of documents) {
    doc.chunks = chunkDocument(doc.content)
    totalChunks += doc.chunks.length
    totalCharacters += doc.content.length
  }
  
  return {
    totalChunks,
    totalCharacters,
    documents
  }
}