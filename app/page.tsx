"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Settings, Code, Network, BookOpen, Github, Twitter, Linkedin } from "lucide-react"
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
    
    // Create a new project with default template
    const newProject: Project = ProjectStorage.createProject(contractName.trim(), network)
    
    // Navigate to the project page
    setTimeout(() => {
      router.push(`/project/${newProject.id}`)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Clarity IDE
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Documentation</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Examples</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">Community</a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Build Secure Smart Contracts
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg mb-10">
            The ultimate development environment for Stacks Clarity smart contracts. 
            Write, test, and deploy secure smart contracts with AI assistance.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg" 
              className="rounded-full px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => setActiveTab("create")}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Project
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full px-8 py-6 text-lg border-white/20 hover:bg-white/10"
              onClick={() => {
                // Example project creation
                const exampleProject = ProjectStorage.createProject("example-contract", "testnet")
                router.push(`/project/${exampleProject.id}`)
              }}
            >
              <Code className="w-5 h-5 mr-2" />
              Try Example
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="create" className="flex items-center gap-2 py-3">
              <Plus className="w-4 h-4" />
              Create New Project
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 py-3">
              <Settings className="w-4 h-4" />
              AI Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
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
                          className="bg-black border-white/20 text-white h-12"
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
                            className={`h-12 ${network === "testnet" ? "bg-white text-black" : "bg-black border-white/20 text-white hover:bg-white/10"}`}
                          >
                            <Network className="w-4 h-4 mr-2" />
                            Testnet
                          </Button>
                          <Button
                            variant={network === "mainnet" ? "default" : "outline"}
                            onClick={() => setNetwork("mainnet")}
                            className={`h-12 ${network === "mainnet" ? "bg-white text-black" : "bg-black border-white/20 text-white hover:bg-white/10"}`}
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
                        className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-12 text-base"
                        size="lg"
                        onClick={handleCreateProject}
                        disabled={!contractName.trim() || isCreating}
                      >
                        {isCreating ? (
                          <>
                            <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
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
              </div>
              
              <div className="space-y-6">
                <Card className="bg-black/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                      Getting Started
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-400 text-xs font-bold">1</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Create Project</h3>
                        <p className="text-sm text-gray-400">Start with a template or blank contract</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-400 text-xs font-bold">2</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">AI Assistance</h3>
                        <p className="text-sm text-gray-400">Use AI to generate and improve your code</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-400 text-xs font-bold">3</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Validate & Deploy</h3>
                        <p className="text-sm text-gray-400">Test your contract and deploy to Stacks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-black/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-green-400" />
                      Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-sm">AI-Powered Code Generation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-sm">Real-time Syntax Validation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-sm">One-click Deployment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-sm">Stacks Blockchain Integration</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Card className="bg-black/50 border-white/10 hover:border-white/20 transition-colors">
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
              
              <Card className="bg-black/50 border-white/10 hover:border-white/20 transition-colors">
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
              
              <Card className="bg-black/50 border-white/10 hover:border-white/20 transition-colors">
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
      
      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Code className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">Clarity IDE</span>
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Clarity IDE. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}