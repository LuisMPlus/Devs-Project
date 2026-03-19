import { Request, Response } from 'express'
import { readJsonFile } from '../utils/jsonReader'

export const getComputerEngineeringSubjects = async (_req: Request, res: Response): Promise<void> => {
  try {
    const subjects = await readJsonFile<any>('src/data/computerEngineeringSubjects.json')
    res.status(200).json(subjects)
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve subjects data' })
  }
}
