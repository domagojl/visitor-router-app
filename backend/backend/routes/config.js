const express = require('express');
const db = require('../dbSetup');

const router = express.Router();



router.post('/create', (req, res) => {
    const { base_url, redirects } = req.body;

    console.log('Raw request body:', req.body);

    if (!base_url || !redirects) {
        console.error('Missing base_url or redirects');
        return res.status(400).json({ error: 'Invalid input' });
    }

    console.log('Valid input received:', { base_url, redirects });

    const id = Date.now().toString(); // Unique ID for this configuration
    const serializedRedirects = JSON.stringify(redirects);

    db.run(
        `INSERT INTO configurations (id, base_url, redirects) VALUES (?, ?, ?)`,
        [id, base_url, serializedRedirects],
        (err) => {
            if (err) {
                console.error('Database error:', err.message);
                res.status(500).json({ error: 'Failed to save configuration' });
            } else {
                console.log('Configuration saved successfully');
                res.json({ script_url: `http://localhost:5001/api/scripts/${id}.js` });
            }
        }
    );
});


// Serve the script
router.get('/scripts/:id.js', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM configurations WHERE id = ?`, [id], (err, row) => {
        if (err || !row) {
            res.status(404).send('Script not found');
        } else {
            const redirects = JSON.parse(row.redirects);
            const apiKey = process.env.ABSTRACT_API_KEY; // Use environment variable for API key
            res.type('application/javascript');
            res.send(`
                function hasBeenRedirected() {
                    return sessionStorage.getItem('redirected') === 'true';
                }

                function markAsRedirected() {
                    sessionStorage.setItem('redirected', 'true');
                }

                const apiKey = "${apiKey}";
                const apiUrl = \`https://ipgeolocation.abstractapi.com/v1/?api_key=\${apiKey}\`;

                if (!hasBeenRedirected()) {
                    fetch(apiUrl)
                        .then(response => response.json())
                        .then(data => {
                            const country = data.country_code.toLowerCase();
                            const redirects = ${JSON.stringify(redirects)};
                            if (redirects[country]) {
                                markAsRedirected();
                                window.location.href = redirects[country];
                            }
                        })
                        .catch(error => console.error('Geo-targeting failed:', error));
                }
            `);
        }
    });
});



module.exports = router;
