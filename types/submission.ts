// Define the form data interface
export interface FormData {
  title: string
  description: string
  url: string
  category: string
  tags: string[]
}

export interface Submission {
  id: string
  title: string
  description: string
  url: string
  category: string
  tags: string[]
  status: string
  submittedAt: string
  submittedBy: string
  approvedAt: string | null
  approvedBy: string | null
  source?: string
}
