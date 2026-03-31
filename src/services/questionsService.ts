import api from './api'

export type QuestionSetName = 'basic-individual-investment-profile'

export interface QuestionCondition {
  operator: string
  value: string
}

export interface FollowUpQuestionGroup {
  condition: QuestionCondition
  questions: InvestmentProfileQuestion[]
}

export interface InvestmentProfileQuestion {
  id: string
  title: string
  content: string
  type: 'boolean' | 'multipleChoice' | 'freeform' | 'date' | 'integer' | 'decimal'
  isRequired: boolean
  displayOrder: number
  choices: string[] | null
  allowsMultipleResponses: boolean
  followUpQuestions: FollowUpQuestionGroup[]
  minValue: number | null
  maxValue: number | null
  helpText: string | null
  createdAt: string
  updatedAt: string
}

export interface InvestmentProfileQuestionsDocument {
  id: string
  name: string
  status: 'current' | 'draft' | 'archived'
  questions: InvestmentProfileQuestion[]
  description: string
  createdDate: string
  createdBy: string
  lastModifiedDate: string
  lastModifiedBy: string
  publishedDate: string | null
  publishedBy: string | null
  archivedDate: string | null
  archiveRetentionExpiry: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateDraftRequest {
  description?: string
  questions: InvestmentProfileQuestion[]
}

export interface PublishQuestionsResult {
  success: boolean
  message: string
  questionSetId?: string
}

const questionsService = {
  getCurrent(name: QuestionSetName = 'basic-individual-investment-profile'): Promise<{ data: InvestmentProfileQuestionsDocument }> {
    return api.get('/api/investment-profile-questions/current', { params: { name } })
  },

  getDraft(): Promise<{ data: InvestmentProfileQuestionsDocument }> {
    return api.get('/api/investment-profile-questions/draft')
  },

  startDraft(): Promise<{ data: InvestmentProfileQuestionsDocument }> {
    return api.post('/api/investment-profile-questions/draft')
  },

  updateDraft(payload: UpdateDraftRequest): Promise<{ data: InvestmentProfileQuestionsDocument }> {
    return api.put('/api/investment-profile-questions/draft', payload)
  },

  discardDraft(): Promise<{ data: { success: boolean; message: string } }> {
    return api.delete('/api/investment-profile-questions/draft')
  },

  publishDraft(): Promise<{ data: PublishQuestionsResult }> {
    return api.post('/api/investment-profile-questions/draft/publish')
  },
}

export default questionsService
