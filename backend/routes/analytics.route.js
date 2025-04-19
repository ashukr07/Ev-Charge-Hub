import express from 'express';
import { getUserAnalytics, getManagerAnalytics,getAdminAnalytics } from '../controllers/analytics.controller.js';
import { protectRoute, isAdmin,isManager } from '../middleware/auth.middleware.js';


const router = express.Router();

router.get('/user', protectRoute, getUserAnalytics);
router.get('/manager', protectRoute,isManager, getManagerAnalytics);
router.get('/admin', protectRoute,isAdmin, getAdminAnalytics);

export default router;
