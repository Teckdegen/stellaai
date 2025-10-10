"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Settings, Code, Network, BookOpen } from "lucide-react"
import { ProjectStorage, type Project } from "@/lib/project-storage"
import { SettingsPanel } from "@/components/settings-panel"
import Image from "next/image"

export default function Home() {
  const router = useRouter()
  const [contractName, setContractName] = useState("")
  const [network, setNetwork] = useState<"mainnet" | "testnet">("testnet")
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState("create")

  const handleCreateProject = () => {
    if (!contractName.trim()) return

    setIsCreating(true)
    
    // Create a new project
    const newProject: Project = {
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      contractName: contractName.trim(),
      clarFile: "",
      network,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    ProjectStorage.saveProject(newProject)
    
    // Navigate to the project page
    router.push(`/project/${newProject.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Code className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Clarity IDE
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            The ultimate development environment for Stacks Clarity smart contracts. 
            Write, test, and deploy secure smart contracts with AI assistance.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Project
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              AI Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <Card className="bg-black/50 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  New Clarity Contract
                </CardTitle>
                <CardDescription>
                  Start a new smart contract project for the Stacks blockchain
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
                      placeholder="my-awesome-contract"
                      className="bg-black border-white/20 text-white"
                    />
                    <p className="text-xs text-gray-500">
                      This will be used as your contract identifier on the Stacks blockchain
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Network</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={network === "testnet" ? "default" : "outline"}
                        onClick={() => setNetwork("testnet")}
                        className={network === "testnet" ? "bg-white text-black" : "bg-black border-white/20 text-white hover:bg-white/10"}
                      >
                        <Network className="w-4 h-4 mr-2" />
                        Testnet
                      </Button>
                      <Button
                        variant={network === "mainnet" ? "default" : "outline"}
                        onClick={() => setNetwork("mainnet")}
                        className={network === "mainnet" ? "bg-white text-black" : "bg-black border-white/20 text-white hover:bg-white/10"}
                      >
                        <Network className="w-4 h-4 mr-2" />
                        Mainnet
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {network === "testnet" 
                        ? "Use for testing and development (free STX available from faucet)" 
                        : "Use for production deployment (requires real STX)"}
                    </p>
                  </div>
                  
                  <Button
                    className="w-full rounded-lg bg-white text-black hover:bg-gray-200 h-12 text-base"
                    size="lg"
                    onClick={handleCreateProject}
                    disabled={!contractName.trim() || isCreating}
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin w-4 h-4 mr-2 border-2 border-black border-t-transparent rounded-full" />
                        Creating Project...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Project
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <Card className="bg-black/50 border-white/10">
                <CardHeader>
                  <BookOpen className="w-8 h-8 text-blue-400 mb-2" />
                  <CardTitle>Documentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">
                    Learn about Clarity language features and best practices for smart contract development.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-black/50 border-white/10">
                <CardHeader>
                  <Network className="w-8 h-8 text-purple-400 mb-2" />
                  <CardTitle>Stacks Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">
                    Deploy to the Stacks blockchain and interact with the decentralized internet.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-black/50 border-white/10">
                <CardHeader>
                  <Code className="w-8 h-8 text-green-400 mb-2" />
                  <CardTitle>AI Assistance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm">
                    Get real-time help with writing, debugging, and optimizing your smart contracts.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}