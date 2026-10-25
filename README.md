# Pimlico romantic restaurant website

## Run locally
1. Install Node.js LTS from https://nodejs.org/
2. Open this folder in VS Code.
3. In Terminal, run `npm install`
4. Run `npm start`
5. Open http://localhost:3000 in your browser.

Keep the terminal running while testing reservations, support messages, and reviews.
Do not open `public/index.html` directly and do not use GitHub Pages to test the forms: the forms require the Node.js/Express backend.

## Where records are stored
The server creates `data/records.json` automatically and stores reservation requests, support messages, and reviews there. Reservation requests remain pending until staff confirms availability.

## Deployment note
A static GitHub repository does not run this backend. For public live forms, deploy the Node.js server to a Node-compatible host and use persistent storage/database for production.
