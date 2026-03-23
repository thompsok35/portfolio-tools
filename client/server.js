import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// Rely natively on Nixpacks dynamic ingress port mapping, gracefully falling back to 3000 locally
const port = process.env.PORT || 3000;

// Expose the precisely compiled Vite production bundle
app.use(express.static(join(__dirname, 'dist')));

// Serve lightweight health-checks for Nginx heartbeat tracking
app.get('/health', (req, res) => res.status(200).send('OK'));

// Standard SPA wildcard fallback to seamlessly support React Router
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Bind openly to all IPv4 interfaces to satisfy containerized ingress routing natively
app.listen(port, "0.0.0.0", () => {
    console.log(`Static server dynamically bound and listening on port ${port}`);
});
