// Chat history and code storage utilities

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface ChatHistory {
  projectId: string
  messages: ChatMessage[]
  codeVersions: Array<{
    code: string
    timestamp: string
    reason?: string
  }>
}

const CHAT_HISTORY_PREFIX = "chat-history-"

export class ChatHistoryManager {
  static saveMessage(projectId: string, message: Omit<ChatMessage, "timestamp">): void {
    try {
      const history = this.getHistory(projectId)
      const timestamp = new Date().toISOString()
      
      history.messages.push({
        ...message,
        timestamp
      })
      
      localStorage.setItem(`${CHAT_HISTORY_PREFIX}${projectId}`, JSON.stringify(history))
    } catch (error) {
      console.error("Error saving chat message:", error)
    }
  }

  static saveCodeVersion(projectId: string, code: string, reason?: string): void {
    try {
      const history = this.getHistory(projectId)
      const timestamp = new Date().toISOString()
      
      history.codeVersions.push({
        code,
        timestamp,
        reason
      })
      
      localStorage.setItem(`${CHAT_HISTORY_PREFIX}${projectId}`, JSON.stringify(history))
    } catch (error) {
      console.error("Error saving code version:", error)
    }
  }

  static getHistory(projectId: string): ChatHistory {
    try {
      const stored = localStorage.getItem(`${CHAT_HISTORY_PREFIX}${projectId}`)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
    }
    
    return {
      projectId,
      messages: [],
      codeVersions: []
    }
  }

  static clearHistory(projectId: string): void {
    try {
      localStorage.removeItem(`${CHAT_HISTORY_PREFIX}${projectId}`)
    } catch (error) {
      console.error("Error clearing chat history:", error)
    }
  }

  static getAllHistory(): Record<string, ChatHistory> {
    try {
      const history: Record<string, ChatHistory> = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(CHAT_HISTORY_PREFIX)) {
          const projectId = key.replace(CHAT_HISTORY_PREFIX, "")
          history[projectId] = this.getHistory(projectId)
        }
      }
      return history
    } catch (error) {
      console.error("Error getting all chat history:", error)
      return {}
    }
  }
}