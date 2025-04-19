import express from 'express';
import { protectRoute, isAdmin, isManager } from '../middleware/auth.middleware.js';

import { addStation, approveStation, getApprovedStations, getAllStations, updateStation, getManagerStation, rejectStation, getUnapprovedStations, getBookingsForStation } from '../controllers/station.controller.js';

const router = express.Router();

router.post("/add", protectRoute, isManager, addStation); 

//approve station by admin
router.put("/approve/:stationId", protectRoute, isAdmin, approveStation);
router.put("/reject/:stationId", protectRoute, isAdmin, rejectStation);

//get all approved stations
router.get("/approved", getApprovedStations);

//get all stations including pending and approved
router.get("/all", protectRoute, isAdmin, getAllStations);
router.get("/unapproved", protectRoute, isAdmin, getUnapprovedStations);
//update station details
router.put("/:stationId/update", protectRoute, isManager, updateStation);

router.get("/manager-station",protectRoute,isManager,getManagerStation)
router.get("/bookings/:stationId",protectRoute,isManager,getBookingsForStation)

export default router;
