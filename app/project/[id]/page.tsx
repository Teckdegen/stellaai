"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Home, Loader2, ExternalLink, Menu, Code, Network } from "lucide-react"
import { ChatPanel } from "@/components/chat-panel"
import { CodeEditor } from "@/components/code-editor"
import { ConsolePanel } from "@/components/console-panel"
import { validateClarityCode } from "@/lib/clarity-validator"
import { ProjectStorage, type Project } from "@/lib/project-storage"
import { deployContractWithPrivateKey } from "@/lib/stacks-wallet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [clarCode, setClarCode] = useState("")
  const [consoleMessages, setConsoleMessages] = useState<
    Array<{ type: "info" | "error" | "success"; message: string; timestamp: string }>
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
        { type: "success", message: "Stella AI is ready to help you build!", timestamp },
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
            type: "info",
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
          message: "✓ Code validation passed",
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
        { type: "error", message: "⚠ Project data not loaded", timestamp },
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
        { type: "error", message: "⚠ Cannot deploy: Code has validation errors", timestamp },
      ])
      return
    }
    
    // Display warnings before deployment
    if (validation.warnings.length > 0) {
      setConsoleMessages((prev) => [
        ...prev,
        { type: "info", message: `⚠ Code has ${validation.warnings.length} warning(s). Review before deploying.`, timestamp },
      ])
    }

    // Add safety check for clarCode
    if (!clarCode || !clarCode.trim()) {
      setConsoleMessages((prev) => [
        ...prev,
        { type: "error", message: "⚠ Cannot deploy: No code to deploy", timestamp },
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
      { type: "info", message: "🚀 Initiating deployment to Stacks blockchain...", timestamp },
      { type: "info", message: `📡 Network: ${project.network}`, timestamp },
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
          { type: "success", message: `✅ Deployment successful!`, timestamp: successTimestamp },
          { type: "info", message: `Transaction ID: ${txId}`, timestamp: successTimestamp },
          {
            type: "info",
            message: `🔍 View on explorer: https://explorer.stacks.co/txid/${txId}?chain=${network}`,
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
          { type: "error", message: `❌ Deployment failed: ${error}`, timestamp: errorTimestamp },
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  const explorerUrl = deployedTxId ? `https://explorer.stacks.co/txid/${deployedTxId}?chain=${project.network}` : null

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Professional Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0 bg-card">
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <ChatPanel
                projectId={project.id}
                onCodeUpdate={handleCodeUpdate}
                currentCode={clarCode}
                contractName={project.contractName}
                network={project.network}
              />
            </SheetContent>
          </Sheet>

          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="hidden lg:flex rounded-full">
            <Home className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-base">{project.contractName}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Network className="w-3 h-3" />
                <span className="capitalize font-medium">{project.network}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleDeploy}
            disabled={isDeploying || !clarCode.trim()}
            className="hidden sm:flex rounded-full px-4"
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
            className="sm:hidden rounded-full"
          >
            {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel - Desktop only */}
        <div className="hidden lg:block w-1/4 border-r border-border bg-card">
          <ChatPanel
            projectId={project.id}
            onCodeUpdate={handleCodeUpdate}
            currentCode={clarCode}
            contractName={project.contractName}
            network={project.network}
          />
        </div>

        {/* Editor and Console */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 border-b border-border overflow-hidden bg-card">
            <CodeEditor code={clarCode} onChange={handleCodeChange} />
          </div>

          {/* Console Panel */}
          <div className="h-1/4 overflow-hidden bg-card">
            <ConsolePanel messages={consoleMessages} onClear={handleClearConsole} />
          </div>
        </div>
      </div>

      {/* Private Key Dialog */}
      <Dialog open={showPrivateKeyDialog} onOpenChange={setShowPrivateKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>🔐</span>
              <span>Deploy Contract</span>
            </DialogTitle>
            <DialogDescription>
              Enter your Stacks private key to deploy the contract. Your private key is never stored or transmitted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="privateKey" className="text-sm font-medium">Private Key</label>
              <Input
                id="privateKey"
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your Stacks private key"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPrivateKeyDialog(false)} className="rounded-full">
                Cancel
              </Button>
              <Button 
                onClick={handleDeployWithPrivateKey} 
                disabled={!privateKey.trim()} 
                className="rounded-full"
              >
                Deploy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deployment Success Dialog */}
      <Dialog open={!!deployedTxId} onOpenChange={() => setDeployedTxId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>🎉</span>
              <span>Deployment Successful!</span>
            </DialogTitle>
            <DialogDescription>Your contract has been deployed to the Stacks {project.network}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs font-mono break-all">{deployedTxId}</p>
            </div>
            {explorerUrl && (
              <Button className="w-full rounded-full" onClick={() => window.open(explorerUrl, "_blank")}>
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