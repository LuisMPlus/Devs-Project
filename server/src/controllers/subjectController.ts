import { Request, Response } from 'express'
import { readJsonFile } from '../utils/jsonReader'

// Map of career slugs to their JSON data files.
// Add a new entry here when you add a new career JSON.
const CAREER_FILE_MAP: Record<string, string> = {
  'computer-engineering':  'src/data/computerEngineeringSubjects.json',
  'bachelor-in-systems':   'src/data/bachelorInSystemsSubjects.json',
}

export const getSubjectsByCareer = async (req: Request, res: Response): Promise<void> => {
  const { careerSlug } = req.params
  const filePath = CAREER_FILE_MAP[careerSlug]

  if (!filePath) {
    res.status(404).json({ error: `No data found for career slug: "${careerSlug}"` })
    return
  }

  try {
    const subjects = await readJsonFile<any>(filePath)
    res.status(200).json(subjects)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve subjects data' })
  }
}

// Keep backward-compatible export for any existing references
export const getComputerEngineeringSubjects = getSubjectsByCareer
