const jwt = require('jsonwebtoken');

// Load the secret key from the environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

module.exports = (req, res, next) => {
    // Check for the authorization header
    const authHeader = req.headers.authorization;

    console.log("Auth Header:", authHeader); // Log the authorization header

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("Token verification failed:", err.message); // Log the error
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }

        console.log("Decoded Token:", decoded); // Log the decoded token

        // Add user information to the request object
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    });
};
