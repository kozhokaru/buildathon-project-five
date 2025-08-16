import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthButton } from "@/components/auth-button"
import { ArrowRight, Network, FileText, MessageSquare, Globe, Brain, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <Link className="mr-6 flex items-center space-x-2" href="/">
              <Network className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                GraphMind
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#features"
              >
                Features
              </Link>
              <Link
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="#how"
              >
                How It Works
              </Link>
              <Link
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                href="https://github.com"
                target="_blank"
              >
                GitHub
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
            </div>
            <nav className="flex items-center">
              <AuthButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background"></div>
        <div className="container relative">
          <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4">
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
                Universal Knowledge-Graph
                <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent"> Builder</span>
              </h1>
              <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                Transform documents into interactive knowledge maps with AI-powered insights. 
                Upload files, enter URLs, or use demo data to visualize connections instantly.
              </p>
              <div className="flex gap-4 mt-8">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Build Your Graph <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard?demo=solar-system">
                  <Button size="lg" variant="outline">
                    Try Demo
                  </Button>
                </Link>
              </div>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Multi-Source Input</span>
                </div>
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-primary" />
                  <span>Interactive Graphs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span>AI-Powered Q&A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container py-20">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
            Transform Information Into Understanding
          </h2>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Upload documents, paste URLs, or use demo data to create interactive knowledge graphs instantly.
          </p>
        </div>
        <div className="mx-auto grid gap-4 md:grid-cols-3 mt-12">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Multi-Source Input</CardTitle>
              <CardDescription>
                Upload PDFs, text files, markdown documents, or paste URLs. 
                Process multiple sources simultaneously to build comprehensive graphs.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• PDF, TXT, MD files</li>
                <li>• Web page extraction</li>
                <li>• Multiple file upload</li>
                <li>• Demo datasets included</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <Network className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Visual Knowledge Map</CardTitle>
              <CardDescription>
                Interactive force-directed graphs that reveal hidden connections. 
                Explore relationships between concepts, people, and ideas.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Interactive exploration</li>
                <li>• Color-coded entities</li>
                <li>• Relationship strengths</li>
                <li>• Zoom & pan controls</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
            <CardHeader className="relative">
              <MessageSquare className="h-10 w-10 text-primary mb-2" />
              <CardTitle>AI-Powered Q&A</CardTitle>
              <CardDescription>
                Ask questions about your data and get intelligent answers that 
                reference the graph structure and relationships.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Natural language queries</li>
                <li>• Context-aware answers</li>
                <li>• Graph-based reasoning</li>
                <li>• Example questions provided</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="container py-20 border-t">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
            How It Works
          </h2>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Three simple steps to transform your documents into interactive knowledge
          </p>
        </div>
        <div className="mx-auto max-w-4xl mt-12">
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                1
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Upload Your Content</h3>
                <p className="text-muted-foreground">
                  Drag and drop files, paste URLs, or select from demo datasets. Support for PDF, TXT, MD, and web pages.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                2
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">AI Extracts Knowledge</h3>
                <p className="text-muted-foreground">
                  Claude analyzes your content to identify key concepts, entities, and relationships automatically.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                3
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Explore & Query</h3>
                <p className="text-muted-foreground">
                  Interact with your knowledge graph visually and ask questions to uncover insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="mx-auto flex max-w-[600px] flex-col items-center gap-4 text-center rounded-lg border bg-card p-8">
          <Sparkles className="h-10 w-10 text-primary" />
          <h2 className="text-2xl font-bold">Ready to Visualize Your Knowledge?</h2>
          <p className="text-muted-foreground">
            Turn any document into an interactive knowledge graph in seconds. No setup required.
          </p>
          <div className="flex gap-4 mt-4">
            <Link href="/dashboard">
              <Button size="lg">Build Your Graph</Button>
            </Link>
            <Link href="/dashboard?demo=solar-system">
              <Button size="lg" variant="outline">Try Demo First</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Network className="h-5 w-5" />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              GraphMind - Transform documents into knowledge. Built for hackathons.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}