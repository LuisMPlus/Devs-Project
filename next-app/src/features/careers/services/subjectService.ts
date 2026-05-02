import type { Subject } from '../types/subject'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api'

/**
 * Generic fetcher: retrieves subjects for any career from the Next.js Route Handler.
 * @param careerSlug  Must match a key in the server's CAREER_FILE_MAP.
 *                    e.g. 'computer-engineering'
 */
export const fetchSubjectsByCareer = async (careerSlug: string): Promise<Subject[]> => {
  try {
    const response = await fetch(`${API_URL}/subjects/${careerSlug}?_t=${Date.now()}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data as Subject[]
  } catch (error) {
    console.error(`Failed to fetch subjects for career "${careerSlug}":`, error)
    return []
  }
}

// Backward-compatible alias
export const fetchComputerEngineeringSubjects = () =>
  fetchSubjectsByCareer('computer-engineering')
