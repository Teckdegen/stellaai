export interface Project {
  id: string
  contractName: string
  network: "testnet" | "mainnet"
  createdAt: string
  updatedAt: string
  clarFile: string
}

const PROJECT_PREFIX = "clarity-project-"
const PROJECT_LIST_KEY = "clarity-projects-list"

// Default template for new Clarity contracts
const DEFAULT_CLARITY_TEMPLATE = `;; ${"{{contractName}}"} Smart Contract
;; ===============================================
;; This contract implements a basic structure for a Clarity smart contract
;; following Stacks blockchain best practices and standards.

;; ===============================================
;; Constants
;; ===============================================
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))

;; ===============================================
;; Data Variables
;; ===============================================
(define-data-var owner principal tx-sender)

;; ===============================================
;; Data Maps
;; ===============================================
;; (define-map example-map { key-name: uint } { value-name: uint })

;; ===============================================
;; Traits
;; ===============================================
;; (define-trait example-trait (
;;   (get-value (uint) (response uint uint))
;; ))

;; ===============================================
;; Public Functions
;; ===============================================

;; ===============================================
;; Read-only Functions
;; ===============================================

;; ===============================================
;; Private Functions
;; ===============================================

;; Example function - replace with your own logic
(define-public (hello-world)
  (ok "Hello, World!"))
`

export class ProjectStorage {
  static createProject(contractName: string, network: "testnet" | "mainnet"): Project {
    const id = Math.random().toString(36).substring(2, 15)
    const now = new Date().toISOString()

    // Create default contract content with the contract name
    const clarFile = DEFAULT_CLARITY_TEMPLATE.replace("{{contractName}}", contractName)

    const project: Project = {
      id,
      contractName: contractName.trim(),
      network,
      createdAt: now,
      updatedAt: now,
      clarFile,
    }

    this.saveProject(project)
    this.addToProjectList(id)

    return project
  }

  static getProject(id: string): Project | null {
    try {
      const stored = localStorage.getItem(`${PROJECT_PREFIX}${id}`)
      if (!stored) return null
      return JSON.parse(stored)
    } catch (error) {
      console.error("Error loading project:", error)
      return null
    }
  }

  static saveProject(project: Project): void {
    try {
      project.updatedAt = new Date().toISOString()
      localStorage.setItem(`${PROJECT_PREFIX}${project.id}`, JSON.stringify(project))
    } catch (error) {
      console.error("Error saving project:", error)
    }
  }

  static updateProjectCode(id: string, code: string): void {
    const project = this.getProject(id)
    if (project) {
      project.clarFile = code
      this.saveProject(project)
    }
  }

  static deleteProject(id: string): void {
    try {
      localStorage.removeItem(`${PROJECT_PREFIX}${id}`)
      this.removeFromProjectList(id)
    } catch (error) {
      console.error("Error deleting project:", error)
    }
  }

  static getAllProjects(): Project[] {
    try {
      const listStr = localStorage.getItem(PROJECT_LIST_KEY)
      if (!listStr) return []

      const ids: string[] = JSON.parse(listStr)
      return ids
        .map((id) => this.getProject(id))
        .filter((p): p is Project => p !== null)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } catch (error) {
      console.error("Error loading projects:", error)
      return []
    }
  }

  private static addToProjectList(id: string): void {
    try {
      const listStr = localStorage.getItem(PROJECT_LIST_KEY)
      const ids: string[] = listStr ? JSON.parse(listStr) : []
      if (!ids.includes(id)) {
        ids.push(id)
        localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(ids))
      }
    } catch (error) {
      console.error("Error updating project list:", error)
    }
  }

  private static removeFromProjectList(id: string): void {
    try {
      const listStr = localStorage.getItem(PROJECT_LIST_KEY)
      if (!listStr) return

      const ids: string[] = JSON.parse(listStr)
      const filtered = ids.filter((i) => i !== id)
      localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error("Error updating project list:", error)
    }
  }

  static exportProject(id: string): string | null {
    const project = this.getProject(id)
    if (!project) return null
    return JSON.stringify(project, null, 2)
  }

  static importProject(jsonString: string): Project | null {
    try {
      const project: Project = JSON.parse(jsonString)
      // Generate new ID to avoid conflicts
      project.id = Math.random().toString(36).substring(2, 15)
      project.createdAt = new Date().toISOString()
      project.updatedAt = new Date().toISOString()

      this.saveProject(project)
      this.addToProjectList(project.id)

      return project
    } catch (error) {
      console.error("Error importing project:", error)
      return null
    }
  }
}