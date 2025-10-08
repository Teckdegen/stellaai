"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Sparkles, Clock, Trash2, FolderOpen, FileText } from "lucide-react"
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <h1 className="text-3xl font-bold">Clarity AI</h1>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              AI-powered smart contract development for the Stacks blockchain
            </p>
          </header>

          {/* Create Project Card */}
          <Card className="bg-white/5 border-white/10 mb-16">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Create New Project
              </CardTitle>
              <CardDescription className="text-gray-400">
                Start building your smart contract with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contract-name" className="text-white">Contract Name</Label>
                  <Input
                    id="contract-name"
                    placeholder="my-contract"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                    className="bg-black border-white/20 text-white rounded"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Network</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={network === "testnet" ? "default" : "outline"}
                      className={`rounded ${network === "testnet" ? "bg-white text-black hover:bg-gray-200" : "bg-black border-white/20 text-white hover:bg-white/10"}`}
                      onClick={() => setNetwork("testnet")}
                    >
                      Testnet
                    </Button>
                    <Button
                      variant={network === "mainnet" ? "default" : "outline"}
                      className={`rounded ${network === "mainnet" ? "bg-white text-black hover:bg-gray-200" : "bg-black border-white/20 text-white hover:bg-white/10"}`}
                      onClick={() => setNetwork("mainnet")}
                    >
                      Mainnet
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full rounded bg-white text-black hover:bg-gray-200"
                  size="lg"
                  onClick={handleCreateProject}
                  disabled={!contractName.trim() || isCreating}
                >
                  {isCreating ? "Creating Project..." : "Create New Project"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Recent Projects
              </h2>
            </div>
            
            {recentProjects.length > 0 ? (
              <div className="grid gap-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer group flex items-center justify-between transition-colors"
                    onClick={() => router.push(`/project/${project.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Code2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{project.contractName}.clar</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                          <span className="capitalize">{project.network}</span>
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
                      className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-8 w-8 text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        setProjectToDelete(project.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent projects</p>
                <p className="text-sm mt-1">Create your first project to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent className="bg-black border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this project? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-black border-white/20 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
              className="bg-white text-black hover:bg-gray-200"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
