import type { Subject } from '../types/subject'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export const fetchComputerEngineeringSubjects = async (): Promise<Subject[]> => {
  try {
    const response = await fetch(`${API_URL}/subjects/computer-engineering?_t=${Date.now()}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data as Subject[]
  } catch (error) {
    console.error('Failed to fetch subjects:', error)
    return []
  }
}
