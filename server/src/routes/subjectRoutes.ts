import { Router } from 'express'
import { getComputerEngineeringSubjects } from '../controllers/subjectController'

const router = Router()

router.get('/computer-engineering', getComputerEngineeringSubjects)

export default router
