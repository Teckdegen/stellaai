"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Sparkles, Shield, Zap, Clock, Trash2, FolderOpen, Menu, BookOpen, Lightbulb, Play, FileCode, Terminal, Github, Twitter, Youtube, FileText, Folder, Settings, Search } from "lucide-react"
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
  const [contractName, setContractName] = useState<string>("")
  const [network, setNetwork] = useState<"testnet" | "mainnet">("testnet")
  const [isCreating, setIsCreating] = useState<boolean>(false)
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
      {/* VS Code-like Header */}
      <header className="border-b border-border bg-[#3c3c3c] text-[#cccccc]">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28c940]"></div>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="font-medium">Stella AI - Clarity IDE</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Run</span>
            <span>Terminal</span>
            <span>Help</span>
          </div>
        </div>
      </header>

      {/* Main Content - VS Code Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-[#333333] text-[#cccccc] flex flex-col">
          <div className="p-4 border-b border-[#3c3c3c]">
            <h2 className="font-semibold flex items-center gap-2">
              <Folder className="w-4 h-4" />
              EXPLORER
            </h2>
          </div>
          <div className="flex-1 p-2">
            <div className="text-xs font-semibold mb-2 flex items-center gap-1">
              <FolderOpen className="w-3 h-3" />
              RECENT PROJECTS
            </div>
            <div className="space-y-1">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="flex items-center gap-2 p-1 rounded hover:bg-[#3c3c3c] cursor-pointer text-xs"
                    onClick={() => router.push(`/project/${project.id}`)}
                  >
                    <FileCode className="w-3 h-3" />
                    <span className="truncate">{project.contractName}.clar</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#888888] p-1">No recent projects</div>
              )}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e]">
          {/* Tab Bar */}
          <div className="flex bg-[#252526] border-b border-[#3c3c3c]">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] border-r border-[#3c3c3c]">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-[#cccccc]">Welcome.md</span>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 flex flex-col md:flex-row">
            {/* Left Column - Editor Preview */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-4xl mx-auto">
                <div className="bg-[#2d2d30] rounded-lg border border-[#3c3c3c] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#3c3c3c]">
                    <h1 className="text-xl font-bold text-[#cccccc]">Welcome to Stella AI</h1>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-[#cccccc] hover:bg-[#3c3c3c]">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
                          <Sparkles className="w-8 h-8 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#cccccc] mb-2">AI-Powered Clarity Development</h2>
                        <p className="text-[#cccccc]/70">
                          Build, test, and deploy secure Stacks blockchain smart contracts with the power of AI
                        </p>
                      </div>

                      {/* Create Project Section */}
                      <Card className="bg-[#252526] border-[#3c3c3c]">
                        <CardHeader>
                          <CardTitle className="text-[#cccccc] flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-400" />
                            Create New Project
                          </CardTitle>
                          <CardDescription className="text-[#cccccc]/70">
                            Start building your smart contract with AI assistance
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="contract-name" className="text-[#cccccc]">Contract Name</Label>
                              <Input
                                id="contract-name"
                                placeholder="my-awesome-contract"
                                value={contractName}
                                onChange={(e) => setContractName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                                className="bg-[#3c3c3c] border-[#3c3c3c] text-[#cccccc] rounded px-3 py-2"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[#cccccc]">Network</Label>
                              <div className="grid grid-cols-2 gap-3">
                                <Button
                                  variant={network === "testnet" ? "default" : "outline"}
                                  className={`rounded ${network === "testnet" ? "bg-blue-600 hover:bg-blue-700" : "bg-[#3c3c3c] border-[#3c3c3c] text-[#cccccc] hover:bg-[#3c3c3c]"}`}
                                  onClick={() => setNetwork("testnet")}
                                >
                                  Testnet
                                </Button>
                                <Button
                                  variant={network === "mainnet" ? "default" : "outline"}
                                  className={`rounded ${network === "mainnet" ? "bg-blue-600 hover:bg-blue-700" : "bg-[#3c3c3c] border-[#3c3c3c] text-[#cccccc] hover:bg-[#3c3c3c]"}`}
                                  onClick={() => setNetwork("mainnet")}
                                >
                                  Mainnet
                                </Button>
                              </div>
                            </div>

                            <Button
                              className="w-full rounded bg-blue-600 hover:bg-blue-700"
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
                          </div>
                        </CardContent>
                      </Card>

                      {/* Features */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="bg-[#252526] p-4 rounded-lg border border-[#3c3c3c]">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-5 h-5 text-green-400" />
                            <h3 className="font-semibold text-[#cccccc]">Secure</h3>
                          </div>
                          <p className="text-sm text-[#cccccc]/70">
                            Built-in validation and best practices for secure smart contracts
                          </p>
                        </div>
                        <div className="bg-[#252526] p-4 rounded-lg border border-[#3c3c3c]">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <h3 className="font-semibold text-[#cccccc]">Fast</h3>
                          </div>
                          <p className="text-sm text-[#cccccc]/70">
                            Powered by Groq's Llama 3.3 70b for instant code generation
                          </p>
                        </div>
                        <div className="bg-[#252526] p-4 rounded-lg border border-[#3c3c3c]">
                          <div className="flex items-center gap-2 mb-2">
                            <Play className="w-5 h-5 text-blue-400" />
                            <h3 className="font-semibold text-[#cccccc]">Deploy</h3>
                          </div>
                          <p className="text-sm text-[#cccccc]/70">
                            One-click deployment to Stacks blockchain with private key
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Recent Projects and Community */}
            <div className="w-full md:w-80 bg-[#252526] border-l border-[#3c3c3c] p-4 overflow-auto">
              <div className="space-y-6">
                {/* Recent Projects */}
                {recentProjects.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-[#cccccc] mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recent Projects
                    </h3>
                    <div className="space-y-2">
                      {recentProjects.map((project) => (
                        <div
                          key={project.id}
                          className="p-3 bg-[#3c3c3c] rounded hover:bg-[#3c3c3c]/70 cursor-pointer group flex items-center justify-between"
                          onClick={() => router.push(`/project/${project.id}`)}
                        >
                          <div className="flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-blue-400" />
                            <div>
                              <div className="text-sm text-[#cccccc] font-medium">{project.contractName}.clar</div>
                              <div className="text-xs text-[#cccccc]/70 flex items-center gap-1">
                                <span className="capitalize">{project.network}</span>
                                <span>•</span>
                                <span>{formatDate(project.updatedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 text-[#cccccc] hover:bg-[#3c3c3c]"
                            onClick={(e) => {
                              e.stopPropagation()
                              setProjectToDelete(project.id)
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Start */}
                <div>
                  <h3 className="text-sm font-semibold text-[#cccccc] mb-3">Quick Start</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start text-left bg-[#3c3c3c] border-[#3c3c3c] text-[#cccccc] hover:bg-[#3c3c3c]/70">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Documentation
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left bg-[#3c3c3c] border-[#3c3c3c] text-[#cccccc] hover:bg-[#3c3c3c]/70">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Examples
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-left bg-[#3c3c3c] border-[#3c3c3c] text-[#cccccc] hover:bg-[#3c3c3c]/70">
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </Button>
                  </div>
                </div>

                {/* Community */}
                <div>
                  <h3 className="text-sm font-semibold text-[#cccccc] mb-3">Join the Community</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" size="sm" className="bg-[#3c3c3c] border-[#3c3c3c] text-[#cccccc] hover:bg-[#3c3c3c]/70">
                      <Github className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="bg-[#3c3c3c] border-[#3c3c3c] text-[#cccccc] hover:bg-[#3c3c3c]/70">
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="bg-[#3c3c3c] border-[#3c3c3c] text-[#cccccc] hover:bg-[#3c3c3c]/70">
                      <Youtube className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-blue-600 text-xs text-white">
        <div className="flex items-center gap-4">
          <span>Stella AI IDE</span>
          <span>Ready</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln 1, Col 1</span>
          <span>UTF-8</span>
          <span>Clarity</span>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent className="bg-[#2d2d30] border-[#3c3c3c]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#cccccc]">Delete Project</AlertDialogTitle>
            <AlertDialogDescription className="text-[#cccccc]/70">
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#3c3c3c] text-[#cccccc] border-[#3c3c3c] hover:bg-[#3c3c3c]/70">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}