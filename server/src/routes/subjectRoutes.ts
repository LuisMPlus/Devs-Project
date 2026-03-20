import { Router } from 'express'
import { getSubjectsByCareer } from '../controllers/subjectController'

const router = Router()

// Generic route: GET /subjects/:careerSlug
router.get('/:careerSlug', getSubjectsByCareer)

export default router
