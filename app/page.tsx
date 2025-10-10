"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Settings, Code, Network } from "lucide-react"
import { ProjectStorage, type Project } from "@/lib/project-storage"
import { SettingsPanel } from "@/components/settings-panel"

export default function Home() {
  const router = useRouter()
  const [contractName, setContractName] = useState("")
  const [network, setNetwork] = useState<"mainnet" | "testnet">("testnet")
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("create")

  const handleCreateProject = () => {
    if (!contractName.trim()) return

    setIsCreating(true)
    
    try {
      // Create a new project with default template
      const newProject: Project = ProjectStorage.createProject(contractName.trim(), network)
      
      // Navigate to the project page
      router.push(`/project/${newProject.id}`)
    } catch (error) {
      console.error("Error creating project:", error)
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center">
              <Code className="w-8 h-8 text-black" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Clarity IDE
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Professional development environment for Stacks Clarity smart contracts
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-black border border-white/10">
            <TabsTrigger 
              value="create" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Plus className="w-4 h-4" />
              New Project
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 py-3 data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Settings className="w-4 h-4" />
              AI Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <Card className="bg-black border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Create New Contract
                </CardTitle>
                <CardDescription>
                  Start a new smart contract project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="contractName">Contract Name</Label>
                    <Input
                      id="contractName"
                      value={contractName}
                      onChange={(e) => setContractName(e.target.value)}
                      placeholder="my-contract"
                      className="bg-black border-white/20 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={network === "testnet" ? "default" : "outline"}
                        onClick={() => setNetwork("testnet")}
                        className={`h-10 ${network === "testnet" ? "bg-white text-black" : "bg-black border-white/20 text-white hover:bg-white/10"}`}
                      >
                        <Network className="w-4 h-4 mr-2" />
                        Testnet
                      </Button>
                      <Button
                        variant={network === "mainnet" ? "default" : "outline"}
                        onClick={() => setNetwork("mainnet")}
                        className={`h-10 ${network === "mainnet" ? "bg-white text-black" : "bg-black border-white/20 text-white hover:bg-white/10"}`}
                      >
                        <Network className="w-4 h-4 mr-2" />
                        Mainnet
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    className="w-full rounded-lg bg-white text-black hover:bg-gray-200 h-10"
                    onClick={handleCreateProject}
                    disabled={!contractName.trim() || isCreating}
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin w-4 h-4 mr-2 border-2 border-black border-t-transparent rounded-full" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Project
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}