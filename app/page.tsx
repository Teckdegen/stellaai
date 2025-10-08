"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Code2, Sparkles, Shield, Zap, Clock, Trash2, FolderOpen, Menu } from "lucide-react"
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/stella-icon.png" alt="Stella AI" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-semibold">Stella AI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Documentation
            </Button>
            <Button variant="ghost" size="sm">
              Examples
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-4 mt-8">
                <Button variant="ghost" className="justify-start">
                  Documentation
                </Button>
                <Button variant="ghost" className="justify-start">
                  Examples
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <span className="text-sm font-medium text-primary px-3 py-1 rounded-full bg-primary/10">
              AI-Powered Smart Contract Editor
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
            Build Clarity contracts with <span className="text-primary">Stella AI</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Create, edit, and deploy Stacks blockchain smart contracts using natural language with Stella, your AI
            assistant.
          </p>
          
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            <a 
              href="/example-contract.clar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View an example Clarity contract
            </a>{' '}
            to understand the syntax and structure.
          </p>

          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            <a 
              href="/example-contract.clar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View an example Clarity contract
            </a>{' '}
            to understand the syntax and structure.
          </p>

          {/* Create Project Card */}
          <Card className="max-w-md mx-auto p-6 space-y-6 mt-12">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract-name">Contract Name</Label>
                <Input
                  id="contract-name"
                  placeholder="my-nft-contract"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                />
              </div>

              <div className="space-y-2">
                <Label>Network</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={network === "testnet" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setNetwork("testnet")}
                  >
                    Testnet
                  </Button>
                  <Button
                    variant={network === "mainnet" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setNetwork("mainnet")}
                  >
                    Mainnet
                  </Button>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleCreateProject}
              disabled={!contractName.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Create Project"}
            </Button>
          </Card>

          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Recent Projects
                </h2>
              </div>
              <div className="grid gap-3 max-w-2xl mx-auto">
                {recentProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/project/${project.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Code2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium">{project.contractName}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="capitalize">{project.network}</span>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(project.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setProjectToDelete(project.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-20 text-left">
            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">AI-Powered Generation</h3>
              <p className="text-sm text-muted-foreground">
                Describe your contract in plain English and let Stella generate production-ready Clarity code.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Built-in Validation</h3>
              <p className="text-sm text-muted-foreground">
                Automatic syntax checking and error detection before deployment to prevent costly mistakes.
              </p>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">One-Click Deploy</h3>
              <p className="text-sm text-muted-foreground">
                Deploy directly to Stacks blockchain with private key. No wallet required.
              </p>
            </Card>
          </div>
        </div>
      </main>

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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}