"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle, Save, Key } from "lucide-react"
import { toast } from "sonner"

interface ApiKeys {
  openai?: string
  claude?: string
  xai?: string
}

interface Settings {
  useCustomApi: boolean
  selectedProvider: 'openai' | 'claude' | 'xai' | 'default'
  apiKeys: ApiKeys
}

const DEFAULT_SETTINGS: Settings = {
  useCustomApi: false,
  selectedProvider: 'default',
  apiKeys: {}
}

export function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('clarity-ide-settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Failed to parse settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('clarity-ide-settings', JSON.stringify(settings))
  }, [settings])

  const handleApiKeyChange = (provider: keyof ApiKeys, value: string) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: {
        ...prev.apiKeys,
        [provider]: value
      }
    }))
  }

  const handleSave = () => {
    setIsSaving(true)
    // In a real app, you would save to a backend or secure storage
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Settings saved successfully')
    }, 500)
  }

  const validateApiKey = async (provider: string, apiKey: string) => {
    setIsValidating(true)
    try {
      // In a real implementation, you would validate the API key with the provider
      // This is just a mock validation for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock validation result
      const isValid = apiKey.length > 20
      
      if (isValid) {
        toast.success(`${provider} API key is valid`)
      } else {
        toast.error(`${provider} API key is invalid`)
      }
    } catch (error) {
      toast.error(`Failed to validate ${provider} API key`)
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            AI Provider Settings
          </CardTitle>
          <CardDescription>
            Configure your own API keys for different AI providers or use our default service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Use Custom AI Provider</h3>
              <p className="text-sm text-gray-500">
                Toggle to use your own API keys instead of our default service
              </p>
            </div>
            <Switch
              checked={settings.useCustomApi}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, useCustomApi: checked }))
              }
            />
          </div>

          {settings.useCustomApi && (
            <div className="space-y-4">
              <div>
                <Label>Select AI Provider</Label>
                <Select
                  value={settings.selectedProvider}
                  onValueChange={(value: 'openai' | 'claude' | 'xai' | 'default') => 
                    setSettings(prev => ({ ...prev, selectedProvider: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                    <SelectItem value="xai">X AI (xAI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.selectedProvider !== 'default' && (
                <Tabs defaultValue={settings.selectedProvider} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger 
                      value="openai" 
                      onClick={() => setSettings(prev => ({ ...prev, selectedProvider: 'openai' }))}
                    >
                      OpenAI
                    </TabsTrigger>
                    <TabsTrigger 
                      value="claude" 
                      onClick={() => setSettings(prev => ({ ...prev, selectedProvider: 'claude' }))}
                    >
                      Claude
                    </TabsTrigger>
                    <TabsTrigger 
                      value="xai" 
                      onClick={() => setSettings(prev => ({ ...prev, selectedProvider: 'xai' }))}
                    >
                      X AI
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="openai" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">OpenAI API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="openai-key"
                          type="password"
                          placeholder="sk-..."
                          value={settings.apiKeys.openai || ''}
                          onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                        />
                        <Button
                          variant="outline"
                          onClick={() => validateApiKey('OpenAI', settings.apiKeys.openai || '')}
                          disabled={isValidating || !settings.apiKeys.openai}
                        >
                          {isValidating ? 'Validating...' : 'Validate'}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Used for GPT models. Get your key from{' '}
                        <a 
                          href="https://platform.openai.com/api-keys" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          OpenAI Dashboard
                        </a>
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="claude" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="claude-key">Claude API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="claude-key"
                          type="password"
                          placeholder="sk-ant-..."
                          value={settings.apiKeys.claude || ''}
                          onChange={(e) => handleApiKeyChange('claude', e.target.value)}
                        />
                        <Button
                          variant="outline"
                          onClick={() => validateApiKey('Claude', settings.apiKeys.claude || '')}
                          disabled={isValidating || !settings.apiKeys.claude}
                        >
                          {isValidating ? 'Validating...' : 'Validate'}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Used for Claude models. Get your key from{' '}
                        <a 
                          href="https://console.anthropic.com/settings/keys" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Anthropic Console
                        </a>
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="xai" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="xai-key">X AI API Key</Label>
                      <div className="flex gap-2">
                        <Input
                          id="xai-key"
                          type="password"
                          placeholder="xai-..."
                          value={settings.apiKeys.xai || ''}
                          onChange={(e) => handleApiKeyChange('xai', e.target.value)}
                        />
                        <Button
                          variant="outline"
                          onClick={() => validateApiKey('X AI', settings.apiKeys.xai || '')}
                          disabled={isValidating || !settings.apiKeys.xai}
                        >
                          {isValidating ? 'Validating...' : 'Validate'}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Used for xAI models like Grok. Get your key from{' '}
                        <a 
                          href="https://platform.x.ai/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          xAI Platform
                        </a>
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Prompts</CardTitle>
          <CardDescription>
            Pre-configured system prompts for each AI provider
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">OpenAI System Prompt</h4>
            <div className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              You are an expert Clarity smart contract developer for the Stacks blockchain. 
              Help users write, debug, and optimize Clarity contracts. 
              Always provide code examples when possible. 
              Focus on security, readability, and best practices.
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Claude System Prompt</h4>
            <div className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              You are a world-class Clarity smart contract engineer specializing in the Stacks blockchain ecosystem. 
              Your expertise includes contract security, optimization, and integration with Stacks features. 
              Provide detailed explanations and code examples. 
              Always consider gas costs and security implications.
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">X AI System Prompt</h4>
            <div className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              You are a cutting-edge Clarity blockchain developer with deep knowledge of the Stacks network. 
              Help users build secure, efficient smart contracts. 
              Explain complex concepts clearly and provide practical examples. 
              Focus on innovation, security, and performance optimization.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}