import fs from 'fs/promises'
import path from 'path'

export const readJsonFile = async <T>(relativeFilePath: string): Promise<T> => {
  try {
    const absolutePath = path.join(process.cwd(), relativeFilePath)
    const fileContents = await fs.readFile(absolutePath, 'utf8')
    return JSON.parse(fileContents) as T
  } catch (error) {
    console.error(`Error reading or parsing JSON file at ${relativeFilePath}:`, error)
    throw new Error('Failed to load JSON data')
  }
}
