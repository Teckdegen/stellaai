"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Key, Bot, Zap, Brain } from "lucide-react"
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

  return (
    <div className="space-y-6">
      <Card className="bg-black border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            AI Provider Configuration
          </CardTitle>
          <CardDescription>
            Configure your own API keys for different AI providers
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
                  <SelectTrigger className="bg-black border-white/20 text-white">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10 text-white">
                    <SelectItem value="openai">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        OpenAI
                      </div>
                    </SelectItem>
                    <SelectItem value="claude">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        Claude (Anthropic)
                      </div>
                    </SelectItem>
                    <SelectItem value="xai">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        X AI (xAI)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.selectedProvider !== 'default' && (
                <Tabs defaultValue={settings.selectedProvider} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-black border border-white/10">
                    <TabsTrigger 
                      value="openai" 
                      className="data-[state=active]:bg-white data-[state=active]:text-black"
                      onClick={() => setSettings(prev => ({ ...prev, selectedProvider: 'openai' }))}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      OpenAI
                    </TabsTrigger>
                    <TabsTrigger 
                      value="claude" 
                      className="data-[state=active]:bg-white data-[state=active]:text-black"
                      onClick={() => setSettings(prev => ({ ...prev, selectedProvider: 'claude' }))}
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      Claude
                    </TabsTrigger>
                    <TabsTrigger 
                      value="xai" 
                      className="data-[state=active]:bg-white data-[state=active]:text-black"
                      onClick={() => setSettings(prev => ({ ...prev, selectedProvider: 'xai' }))}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      X AI
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="openai" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">OpenAI API Key</Label>
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="sk-..."
                        value={settings.apiKeys.openai || ''}
                        onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                        className="bg-black border-white/20 text-white"
                      />
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
                      <Input
                        id="claude-key"
                        type="password"
                        placeholder="sk-ant-..."
                        value={settings.apiKeys.claude || ''}
                        onChange={(e) => handleApiKeyChange('claude', e.target.value)}
                        className="bg-black border-white/20 text-white"
                      />
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
                      <Input
                        id="xai-key"
                        type="password"
                        placeholder="xai-..."
                        value={settings.apiKeys.xai || ''}
                        onChange={(e) => handleApiKeyChange('xai', e.target.value)}
                        className="bg-black border-white/20 text-white"
                      />
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
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-white text-black hover:bg-gray-200"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-black border-t-transparent rounded-full" />
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
    </div>
  )
}