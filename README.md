# Pimlico Romantic Website — Preview-Matched Edition

This version uses **local image files cropped directly from the approved preview image**, so the hero, experience cards, and reservation background are included in the ZIP and don't rely on external image URLs. Google Fonts are optional; the design has serif/sans-serif fallbacks.

## Run locally
1. Extract the ZIP.
2. Open the extracted folder in VS Code.
3. In the terminal, run:
   ```bash
   npm install
   npm start
   ```
4. Open `http://localhost:3000`.

If PowerShell blocks `npm.ps1`, switch the VS Code terminal profile to **Command Prompt** and run the commands there.

## Features
- Responsive romantic burgundy / rose website
- Local background images in `public/images/`
- Reservation requests saved to `data/records.json`
- Customer support messages saved to `data/records.json`
- Guest reviews saved and displayed from the local JSON file

## Important
This is a website concept, not an official Pimlico property site. Reservation requests are saved locally but do not send notifications or confirm a table. Before collecting real customer data or publishing, add staff authentication, moderation, privacy notice, spam protection, secure database backups, HTTPS, and actual venue contact details. The included photos are crops from the preview mockup, not full-resolution original restaurant photographs.
