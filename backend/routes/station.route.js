import express from 'express';
import { protectRoute, isAdmin, isManager } from '../middleware/auth.middleware.js';

import { addStation, approveStation, getApprovedStations, getAllStations, updateStation, getManagerStation } from '../controllers/station.controller.js';

const router = express.Router();

router.post("/add", protectRoute, isManager, addStation); 

//approve station by admin
router.put("/approve/:stationId", protectRoute, isAdmin, approveStation);

//get all approved stations
router.get("/approved", getApprovedStations);

//get all stations including pending and approved
router.get("/all", protectRoute, isAdmin, getAllStations);
//update station details
router.put("/:stationId/update", protectRoute, isManager, updateStation);

router.get("/manager-station",protectRoute,isManager,getManagerStation)

export default router;
