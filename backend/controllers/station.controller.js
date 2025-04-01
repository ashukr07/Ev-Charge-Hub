import Station from "../models/station.model.js";

export const addStation = async (req, res) => { 
    try {
        const { name, latitude, longitude, totalSlots, description, address } = req.body;
        const location = { latitude, longitude };
        const manager = req.user._id;
        //if any field is empty return error
        if (!name || !latitude || !longitude || !totalSlots || !description || !address) {
            return res.status(400).json({ message: "All fields are required" });
        }
        //check if station already exists
        const stationExists = await Station.findOne({
            name,
            location
        })
        if (stationExists) {
            return res.status(400).json({ message: "Station already exists" });
        }
        //create new station
        const station = await Station.create({
            name,
            location,
            totalSlots,
            description,
            address,
            manager
        })
        if (!station) {
            return res.status(400).json({ message: "Station could not be created. Please try again" });
        }
        return res.status(201).json({ message: "Station created successfully", station });
    } catch (error) {
        console.error("Error in addStation controller ", error.message);
        return res.status(500).json({ message: error.message });
    }
}

export const approveStation = async (req, res) => {
    try {
        const { stationId } = req.params;
        const station = await Station.findById(stationId);
        if (!station) {
            return res.status(400).json({ message: "Station not found" });
        }
        station.isApproved = true;
        await station.save();
        return res.status(200).json({ message: "Station approved successfully" });
    } catch (error) {
        console.error("Error in approveStation controller ", error.message);
        return res.status(500).json({ message: error.message });
        
    }
}

export const getApprovedStations = async (req, res) => {
    try {
        const stations = await Station.find({ isApproved: true });
        return res.status(200).json({ stations });
    } catch (error) {
        console.error("Error in getApprovedStations controller ", error.message);
        return res.status(500).json({ message: error.message });
    }
}

export const getAllStations = async (req, res) => {
    try {
        const stations = await Station.find();
        return res.status(200).json({ stations });
    } catch (error) {
        console.error("Error in getAllStations controller ", error.message);
        return res.status(500).json({ message: error.message });
    }
}

export const updateStation = async (req, res) => {
    try {
        const { stationId } = req.params;
        const station = await Station.findById(stationId);

        if (!station) {
            return res.status(404).json({ message: "Station not found" });
        }

        // Extract fields from request body
        const { name, latitude, longitude, totalSlots, description, address } = req.body;

        // Update only provided fields
        if (name) station.name = name;
        if (latitude && longitude) station.location = { latitude, longitude };
        if (totalSlots !== undefined) station.totalSlots = totalSlots;
        if (description) station.description = description;
        if (address) station.address = address;

        await station.save();
        return res.status(200).json({ message: "Station updated successfully", station });

    } catch (error) {
        console.error("Error in updateStation controller:", error.message);
        return res.status(500).json({ message: error.message });
    }
};

export const getManagerStation = async(req,res) => {
    try {
        const manager = req.user._id;
        const station =  await Station.find({manager})
        return res.status(200).json({station})
    } catch (error) {
        console.error("Error in getManagerStation controller")
        return res.status(500).json({message:error.message})
    }
}