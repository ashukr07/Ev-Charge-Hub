import express from 'express';
import { getUserAnalytics, getManagerAnalytics } from '../controllers/analytics.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { isManager } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/user', protectRoute, getUserAnalytics);
router.get('/manager', protectRoute,isManager, getManagerAnalytics);

export default router;
