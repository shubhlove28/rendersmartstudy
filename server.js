const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Database connection
const DB_URI = process.env.DB_URI;

mongoose.connect(DB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Database connection error:", err));

// Schema and Model
const StudySchema = new mongoose.Schema({
    task: String,
    status: String,
    date: { type: Date, default: Date.now }
});

const StudyModel = mongoose.model("StudyData", StudySchema);

// --- FULL CRUD ROUTES ---

// CREATE
app.post("/save-data", async (req, res) => {
    try {
        const newData = new StudyModel(req.body);
        await newData.save();
        res.json({ message: "Data saved to cloud!" });
    } catch (err) {
        res.status(500).json({ message: "Error saving data" });
    }
});

// READ
app.get("/get-data", async (req, res) => {
    try {
        const data = await StudyModel.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching data" });
    }
});

// UPDATE
app.put("/update-data/:id", async (req, res) => {
    try {
        const updatedData = await StudyModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Data updated successfully!", data: updatedData });
    } catch (err) {
        res.status(500).json({ message: "Error updating data" });
    }
});

// DELETE
app.delete("/delete-data/:id", async (req, res) => {
    try {
        await StudyModel.findByIdAndDelete(req.params.id);
        res.json({ message: "Data deleted from cloud!" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting data" });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// Add this route to your server.js
app.get("/", (req, res) => {
    res.send("rendersmartstudy API is live and working!");
});
