const express = require('express');
const db = require('../dbSetup');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Fetch all projects for a user
router.get('/', authMiddleware, (req, res) => {
    const userId = req.user.id;

    db.all(`SELECT * FROM projects WHERE user_id = ?`, [userId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch projects" });
        }
        res.json(rows);
    });
});

// Create a new project
router.post('/', authMiddleware, (req, res) => {
    const { title, base_url, redirects } = req.body; // Change "name" to "title"
    const userId = req.user.id;

    if (!title || !base_url || !redirects) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const serializedRedirects = JSON.stringify(redirects);

    db.run(
        `INSERT INTO projects (user_id, title, base_url, redirects) VALUES (?, ?, ?, ?)`,
        [userId, title, base_url, serializedRedirects],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to create project" });
            }
            res.status(201).json({ id: this.lastID, message: "Project created successfully" });
        }
    );
});


// Delete a project
router.delete('/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.run(`DELETE FROM projects WHERE id = ? AND user_id = ?`, [id, userId], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to delete project" });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.json({ message: "Project deleted successfully" });
    });
});

module.exports = router;
