"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Sparkles, Shield, Zap, Clock, Trash2, FolderOpen, Menu, BookOpen, Lightbulb, Play, FileCode, Terminal, Github, Twitter, Youtube } from "lucide-react"
import { ProjectStorage, type Project } from "@/lib/project-storage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"

export default function LandingPage() {
  const router = useRouter()
  const [contractName, setContractName] = useState("")
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet")
  const [isCreating, setIsCreating] = useState(false)
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  useEffect(() => {
    setRecentProjects(ProjectStorage.getAllProjects().slice(0, 5))
  }, [])

  const handleCreateProject = () => {
    if (!contractName.trim()) return

    setIsCreating(true)

    const project = ProjectStorage.createProject(contractName, network)

    router.push(`/project/${project.id}`)
  }

  const handleDeleteProject = (id: string) => {
    ProjectStorage.deleteProject(id)
    setRecentProjects(ProjectStorage.getAllProjects().slice(0, 5))
    setProjectToDelete(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Sample code to display in the editor preview
  const sampleCode = `;; Welcome to Stella AI - Clarity IDE
;;
;; This is a sample NFT contract following SIP-009 standard
;; You can create your own contracts with natural language!

(define-non-fungible-token nft-token uint)

;; Owner of the contract
(define-constant CONTRACT_OWNER tx-sender)

;; Token minted counter
(define-data-var last-token-id uint u0)

;; Token owner mapping
(define-map token-owners uint principal)

;; Mint a new NFT
(define-public (mint)
  (begin
    (let ((token-id (get-next-token-id)))
      (map-set token-owners token-id tx-sender)
      (nft-mint? nft-token token-id tx-sender)
      (ok token-id))))

;; Get token owner
(define-public (get-owner (token-id uint))
  (begin
    (match (map-get? token-owners token-id)
      owner (ok owner)
      (err u404))))

;; Internal function to get next token ID
(define-private (get-next-token-id)
  (let ((token-id (var-get last-token-id)))
    (var-set last-token-id (+ token-id u1))
    token-id))

;; Transfer NFT to another principal
(define-public (transfer 
  (token-id uint) 
  (recipient principal))
  (begin
    (let ((owner (try! (get-owner token-id))))
      (asserts! (is-eq owner tx-sender) (err u403))
      (map-set token-owners token-id recipient)
      (nft-transfer? nft-token token-id tx-sender recipient)
      (ok true))))`

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Professional Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Stella AI</h1>
              <p className="text-xs text-muted-foreground">Clarity Smart Contract IDE</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="rounded-full">
              <BookOpen className="w-4 h-4 mr-2" />
              Documentation
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full">
              <Lightbulb className="w-4 h-4 mr-2" />
              Examples
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                <Button variant="ghost" className="justify-start rounded-full">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
                <Button variant="ghost" className="justify-start rounded-full">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Examples
                </Button>
                <Button variant="ghost" className="justify-start rounded-full">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Editor Preview and Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold">
                AI-Powered <span className="text-primary">Clarity</span> Development
              </h1>
              <p className="text-lg text-muted-foreground">
                Build, test, and deploy secure Stacks blockchain smart contracts with the power of AI. 
                No blockchain experience required.
              </p>
            </div>

            {/* Editor Preview */}
            <Card className="border-border shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-primary" />
                    contracts/nft-sample.clar
                  </CardTitle>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-64 rounded-b-lg border-t border-border bg-[#1e1e1e]">
                  <pre className="text-sm p-4 font-mono text-green-400 overflow-x-auto">
                    <code>{sampleCode}</code>
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Secure</h3>
                <p className="text-xs text-muted-foreground">Built-in validation and best practices</p>
              </Card>
              <Card className="p-4 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Fast</h3>
                <p className="text-xs text-muted-foreground">Powered by Groq's Llama 3.3 70b</p>
              </Card>
              <Card className="p-4 text-center">
                <Play className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Deploy</h3>
                <p className="text-xs text-muted-foreground">One-click deployment to Stacks</p>
              </Card>
            </div>
          </div>

          {/* Right Column - Create Project and Recent */}
          <div className="space-y-6">
            {/* Create Project Card */}
            <Card className="p-6 space-y-6 shadow-lg">
              <CardHeader className="p-0">
                <CardTitle>Create New Project</CardTitle>
                <CardDescription>Start building your smart contract with AI assistance</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contract-name">Contract Name</Label>
                  <Input
                    id="contract-name"
                    placeholder="my-awesome-contract"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                    className="rounded-lg px-4 py-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Network</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={network === "testnet" ? "default" : "outline"}
                      className="w-full rounded-lg"
                      onClick={() => setNetwork("testnet")}
                    >
                      Testnet
                    </Button>
                    <Button
                      variant={network === "mainnet" ? "default" : "outline"}
                      className="w-full rounded-lg"
                      onClick={() => setNetwork("mainnet")}
                    >
                      Mainnet
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                className="w-full rounded-lg py-2"
                size="lg"
                onClick={handleCreateProject}
                disabled={!contractName.trim() || isCreating}
              >
                {isCreating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Creating Project...
                  </div>
                ) : (
                  "Create New Project"
                )}
              </Button>
            </Card>

            {/* Recent Projects */}
            {recentProjects.length > 0 && (
              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    Recent Projects
                  </CardTitle>
                </CardHeader>
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="p-3 hover:bg-accent rounded-lg cursor-pointer group border transition-colors flex items-center justify-between"
                      onClick={() => router.push(`/project/${project.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Code2 className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-sm truncate max-w-[120px]">{project.contractName}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="capitalize font-medium px-2 py-0.5 bg-muted rounded-full">
                              {project.network}
                            </span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(project.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          setProjectToDelete(project.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Community Links */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Join the Community</CardTitle>
                <CardDescription>Connect with other Clarity developers</CardDescription>
              </CardHeader>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="flex-1 rounded-lg">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
                <Button variant="outline" size="sm" className="flex-1 rounded-lg">
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm" className="flex-1 rounded-lg">
                  <Youtube className="w-4 h-4 mr-2" />
                  YouTube
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Powerful Features for Smart Contract Development</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build, test, and deploy secure Stacks blockchain smart contracts
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">AI-Powered Generation</h3>
              <p className="text-sm text-muted-foreground">
                Describe your contract in plain English and let Stella generate production-ready Clarity code.
              </p>
            </Card>

            <Card className="p-6 space-y-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Built-in Validation</h3>
              <p className="text-sm text-muted-foreground">
                Automatic syntax checking and error detection before deployment to prevent costly mistakes.
              </p>
            </Card>

            <Card className="p-6 space-y-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Terminal className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Real-time Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Get instant feedback and suggestions as you build, with detailed explanations of best practices.
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Built with ❤️ for the Stacks ecosystem. Powered by Groq's Llama 3.3 70b model.
          </p>
        </div>
      </footer>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}