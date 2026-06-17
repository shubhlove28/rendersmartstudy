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
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.error("❌ Database connection error:", err));

// --- SCHEMA & MODEL ---
const StudySchema = new mongoose.Schema({
    category: String, 
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

// 2. READ (Get data based on type)
app.get("/:type", async (req, res) => {
    // Stop the browser from querying the database for a favicon
    if (req.params.type === 'favicon.ico') return res.status(204).end();

    try {
        // Safety Check: Make sure database is actually connected before querying
        if (mongoose.connection.readyState !== 1) {
            console.warn("Database booting up, delaying request...");
            return res.status(503).json({ message: "Database starting up" });
        }

        console.log("Fetching category:", req.params.type);
        const data = await StudyModel.find({ category: req.params.type });
        res.json(data || []); // Always return an array, even if empty
    } catch (err) {
        console.error(`Database error on ${req.params.type}:`, err);
        res.status(500).json({ message: "Error fetching data" });
    }
});

// 3. CREATE (Save new data)
app.post("/:type", async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ message: "Database not connected" });
        }
        const newData = new StudyModel({ ...req.body, category: req.params.type });
        await newData.save();
        res.json({ message: "Data saved successfully!" });
    } catch (err) {
        console.error("Save error:", err);
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
