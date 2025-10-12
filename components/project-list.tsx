"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProjectStorage, type Project } from "@/lib/project-storage"
import { Trash2, Clock, Code } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ProjectListProps {
  onProjectDeleted?: () => void
}

export function ProjectList({ onProjectDeleted }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadProjects = () => {
    try {
      const allProjects = ProjectStorage.getAllProjects()
      setProjects(allProjects)
    } catch (error) {
      console.error("Error loading projects:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleDeleteProject = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      try {
        ProjectStorage.deleteProject(projectId)
        loadProjects()
        if (onProjectDeleted) onProjectDeleted()
      } catch (error) {
        console.error("Error deleting project:", error)
      }
    }
  }

  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8">
        <Code className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500">No projects yet. Create your first Clarity smart contract!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Card 
          key={project.id} 
          className="bg-black border-white/10 hover:border-white/20 transition-colors cursor-pointer"
          onClick={() => handleProjectClick(project.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold truncate flex-1">
                {project.contractName}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={(e) => handleDeleteProject(project.id, e)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="flex items-center gap-1">
              <Badge variant="secondary" className="capitalize">
                {project.network}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-gray-500 mt-2">
              <Clock className="h-3 w-3 mr-1" />
              Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}