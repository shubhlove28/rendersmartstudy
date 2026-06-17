const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Use the port Render assigns, or default to 3000 locally
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const DB_URI = process.env.DB_URI;

mongoose.connect(DB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Database connection error:", err));

// --- SCHEMA & MODEL ---
// A flexible schema that holds all possible fields for your different data types
const StudySchema = new mongoose.Schema({
    category: String, // Tracks if it's a 'tasks', 'notes', 'resources', or 'flashcards'
    title: String,
    content: String,
    url: String,
    due: String,
    priority: String,
    done: Boolean,
    question: String,
    answer: String,
    date: { type: Date, default: Date.now }
});

// This automatically copies MongoDB's internal '_id' to a standard 'id' 
// so your frontend script.js buttons work perfectly without changing any HTML.
StudySchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id;
        return ret;
    }
});

const StudyModel = mongoose.model("StudyData", StudySchema);

// --- ROUTES ---

// 1. HEALTH CHECK (Homepage)
app.get("/", (req, res) => {
    res.json({
        status: "Online",
        message: "Smart Study Assistant API is live and working!"
    });
});

// 2. READ (Get data based on type: /tasks, /notes, /resources, /flashcards)
app.get("/:type", async (req, res) => {
    try {
        console.log("Fetching category:", req.params.type); // Check your Render logs!
        const data = await StudyModel.find({ category: req.params.type });
        res.json(data);
    } catch (err) {
        console.error("Database error:", err); // This will tell us the real reason for the 500
        res.status(500).json({ message: "Error fetching data" });
    }
});
// 3. CREATE (Save new data)
app.post("/:type", async (req, res) => {
    try {
        // Automatically tags the data with the correct category from the URL
        const newData = new StudyModel({ ...req.body, category: req.params.type });
        await newData.save();
        res.json({ message: "Data saved successfully!" });
    } catch (err) {
        res.status(500).json({ message: "Error saving data" });
    }
});

// 4. UPDATE (Used for checking off tasks)
app.put("/:type/:id", async (req, res) => {
    try {
        const updatedData = await StudyModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Data updated successfully!", data: updatedData });
    } catch (err) {
        res.status(500).json({ message: "Error updating data" });
    }
});

// 5. DELETE (Remove tasks or flashcards)
app.delete("/:type/:id", async (req, res) => {
    try {
        await StudyModel.findByIdAndDelete(req.params.id);
        res.json({ message: "Data deleted from cloud!" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting data" });
    }
});

// --- START SERVER ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
