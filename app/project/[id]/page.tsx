"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Home, Loader2, ExternalLink, Menu, Code, Network, Key, CheckCircle, AlertCircle, Send, Wifi, Info } from "lucide-react"
import { ChatPanel } from "@/components/chat-panel"
import { CodeEditor } from "@/components/code-editor"
import { ConsolePanel } from "@/components/console-panel"
import { validateClarityCode } from "@/lib/clarity-validator"
import { ProjectStorage, type Project } from "@/lib/project-storage"
import { deployContractWithPrivateKey } from "@/lib/stacks-wallet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"
import Image from "next/image"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [clarCode, setClarCode] = useState("")
  const [consoleMessages, setConsoleMessages] = useState<
    Array<{ type: "info" | "error" | "success" | "warning"; message: string; timestamp: string }>
  >([])
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedTxId, setDeployedTxId] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showPrivateKeyDialog, setShowPrivateKeyDialog] = useState(false)
  const [privateKey, setPrivateKey] = useState("")

  useEffect(() => {
    const projectId = params.id as string
    const proj = ProjectStorage.getProject(projectId)

    if (proj) {
      setProject(proj)
      setClarCode(proj.clarFile || "")

      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      setConsoleMessages([
        { type: "info", message: `Project loaded: ${proj.contractName}`, timestamp },
        { type: "info", message: `Network: ${proj.network}`, timestamp },
        { type: "success", message: "Clarity AI is ready to help you build!", timestamp },
      ])
    } else {
      router.push("/")
    }
  }, [params.id, router])

  const handleCodeUpdate = (newCode: string, reason?: string) => {
    setClarCode(newCode)

    if (project) {
      ProjectStorage.updateProjectCode(project.id, newCode)
      const updated = ProjectStorage.getProject(project.id)
      if (updated) setProject(updated)
    }

    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    if (reason) {
      setConsoleMessages((prev) => [...prev, { type: "info", message: reason, timestamp }])
    }

    const validation = validateClarityCode(newCode)

    // Display errors
    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        setConsoleMessages((prev) => [
          ...prev,
          {
            type: "error",
            message: `Line ${error.line}: ${error.message}`,
            timestamp,
          },
        ])
      })
    }

    // Display warnings
    if (validation.warnings.length > 0) {
      validation.warnings.forEach((warning) => {
        setConsoleMessages((prev) => [
          ...prev,
          {
            type: "warning",
            message: `Warning Line ${warning.line}: ${warning.message}`,
            timestamp,
          },
        ])
      })
    }

    // Display success message only if valid and has content
    if (validation.isValid && newCode.trim()) {
      setConsoleMessages((prev) => [
        ...prev,
        {
          type: "success",
          message: "Code validation passed",
          timestamp,
        },
      ])
    }
  }

  const handleCodeChange = (newCode: string) => {
    setClarCode(newCode)
    if (project) {
      ProjectStorage.updateProjectCode(project.id, newCode)
    }
  }

  const handleDeploy = async () => {
    // Add safety check for project
    if (!project) {
      const timestamp = new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      setConsoleMessages((prev) => [
        ...prev,
        { type: "error", message: "Project data not loaded", timestamp },
      ])
      return
    }

    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    const validation = validateClarityCode(clarCode)
    if (!validation.isValid) {
      setConsoleMessages((prev) => [
        ...prev,
        { type: "error", message: "Cannot deploy: Code has validation errors", timestamp },
      ])
      return
    }
    
    // Display warnings before deployment
    if (validation.warnings.length > 0) {
      setConsoleMessages((prev) => [
        ...prev,
        { type: "info", message: `Code has ${validation.warnings.length} warning(s). Review before deploying.`, timestamp },
      ])
    }

    // Add safety check for clarCode
    if (!clarCode || !clarCode.trim()) {
      setConsoleMessages((prev) => [
        ...prev,
        { type: "error", message: "Cannot deploy: No code to deploy", timestamp },
      ])
      return
    }

    // Show private key dialog
    setShowPrivateKeyDialog(true)
  }

  const handleDeployWithPrivateKey = async () => {
    if (!project) return

    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    setIsDeploying(true)
    setShowPrivateKeyDialog(false)
    setConsoleMessages((prev) => [
      ...prev,
      { type: "info", message: "Initiating deployment to Stacks blockchain...", timestamp },
      { type: "info", message: `Network: ${project.network}`, timestamp },
      { type: "info", message: "Make sure your wallet has sufficient STX for transaction fees", timestamp },
    ])

    // Add safety checks for required project properties
    const contractName = project.contractName || "unnamed-contract"
    const network = project.network || "testnet"

    await deployContractWithPrivateKey(
      contractName,
      clarCode,
      network,
      privateKey,
      (txId: string) => {
        const successTimestamp = new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        setConsoleMessages((prev) => [
          ...prev,
          { type: "success", message: `Deployment successful!`, timestamp: successTimestamp },
          { type: "info", message: `Transaction ID: ${txId}`, timestamp: successTimestamp },
          {
            type: "info",
            message: `View on explorer: https://explorer.stacks.co/txid/${txId}?chain=${network}`,
            timestamp: successTimestamp,
          },
        ])
        setDeployedTxId(txId)
        setIsDeploying(false)
        setPrivateKey("") // Clear private key after deployment
      },
      (error: string) => {
        const errorTimestamp = new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
        setConsoleMessages((prev) => [
          ...prev,
          { type: "error", message: `Deployment failed: ${error}`, timestamp: errorTimestamp },
        ])
        setIsDeploying(false)
      },
    )
  }

  const handleClearConsole = () => {
    setConsoleMessages([])
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    )
  }

  const explorerUrl = deployedTxId ? `https://explorer.stacks.co/txid/${deployedTxId}?chain=${project.network}` : null
  const fileName = `${project.contractName}.clar`

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Professional Header */}
      <header className="border-b border-white/10 px-4 py-3 flex items-center justify-between flex-shrink-0 bg-black">
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 bg-black border-white/10">
              <ChatPanel
                projectId={project.id}
                onCodeUpdate={handleCodeUpdate}
                currentCode={clarCode}
                contractName={project.contractName}
                network={project.network}
              />
            </SheetContent>
          </Sheet>

          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="hidden lg:flex rounded-full text-white hover:bg-white/10">
            <Home className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-base text-white">{project.contractName}.clar</h1>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Network className="w-3 h-3" />
                <span className="capitalize">{project.network}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleDeploy}
            disabled={isDeploying || !clarCode.trim()}
            className="hidden sm:flex rounded-full px-4 bg-white text-black hover:bg-gray-200"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Deploy Contract
              </>
            )}
          </Button>
          <Button 
            size="icon" 
            onClick={handleDeploy} 
            disabled={isDeploying || !clarCode.trim()} 
            className="sm:hidden rounded-full bg-white text-black hover:bg-gray-200"
          >
            {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content - Resizable layout */}
      <div className="flex-1 flex overflow-hidden">
        <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
          {/* Chat Panel - Desktop only */}
          <Panel 
            defaultSize={30} 
            minSize={25} 
            maxSize={40}
            className="hidden lg:block border-r border-white/10 bg-black"
          >
            <div className="h-full">
              <ChatPanel
                projectId={project.id}
                onCodeUpdate={handleCodeUpdate}
                currentCode={clarCode}
                contractName={project.contractName}
                network={project.network}
              />
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-2 bg-white/10 hover:bg-white/20 transition-colors cursor-col-resize" />
          
          {/* Editor and Console - Flexible area */}
          <Panel defaultSize={70} minSize={60} className="flex flex-col overflow-hidden">
            <PanelGroup direction="vertical" className="flex-1 overflow-hidden">
              {/* Code Editor - Takes most space */}
              <Panel 
                defaultSize={70} 
                minSize={50}
                className="border-b border-white/10 bg-black relative overflow-hidden"
              >
                <div className="h-full">
                  <CodeEditor code={clarCode} onChange={handleCodeChange} fileName={fileName} />
                </div>
              </Panel>
              
              <PanelResizeHandle className="h-2 bg-white/10 hover:bg-white/20 transition-colors cursor-row-resize" />
              
              {/* Console Panel - Fixed height */}
              <Panel 
                defaultSize={30} 
                minSize={25}
                className="bg-black relative overflow-hidden"
              >
                <div className="h-full">
                  <ConsolePanel messages={consoleMessages} onClear={handleClearConsole} />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>

      {/* Private Key Dialog */}
      <Dialog open={showPrivateKeyDialog} onOpenChange={setShowPrivateKeyDialog}>
        <DialogContent className="sm:max-w-md bg-black border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              <span>Deploy Contract</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your Stacks private key to deploy the contract. Your private key is never stored or transmitted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-white/5 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-300">
                  <p className="font-medium mb-1">Deployment Requirements:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Ensure your wallet has sufficient STX for transaction fees</li>
                    <li>For testnet, get STX from the <a href="https://explorer.stacks.co/sandbox/faucet?chain=testnet" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">faucet</a></li>
                    <li>Contract name must be unique for your address</li>
                  </ul>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="privateKey" className="text-sm font-medium text-white">Private Key</label>
              <Input
                id="privateKey"
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your Stacks private key"
                className="mt-1 bg-black border-white/20 text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPrivateKeyDialog(false)} className="rounded-full bg-black border-white/20 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button 
                onClick={handleDeployWithPrivateKey} 
                disabled={!privateKey.trim()} 
                className="rounded-full bg-white text-black hover:bg-gray-200"
              >
                Deploy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deployment Success Dialog */}
      <Dialog open={!!deployedTxId} onOpenChange={() => setDeployedTxId(null)}>
        <DialogContent className="bg-black border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Deployment Successful!</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">Your contract has been deployed to the Stacks {project.network}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-xs font-mono break-all text-white">{deployedTxId}</p>
            </div>
            {explorerUrl && (
              <Button className="w-full rounded-full bg-white text-black hover:bg-gray-200" onClick={() => window.open(explorerUrl, "_blank")}>
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Stacks Explorer
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}