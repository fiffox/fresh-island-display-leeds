# Fresh Island Foods Clocking-In Display

This folder is ready to upload to GitHub Pages.

## Files
- index.html
- style.css
- script.js
- fresh-island-logo.svg

## Publish with GitHub Pages
1. Sign in to GitHub.
2. Create a new PUBLIC repository, for example: `fresh-island-display`.
3. Choose "uploading an existing file".
4. Upload ALL FOUR dashboard files from this folder.
5. Commit the files.
6. Open the repository's Settings.
7. Open Pages.
8. Under "Build and deployment", choose "Deploy from a branch".
9. Choose branch `main` and folder `/(root)`.
10. Click Save.
11. Wait a minute or two. GitHub Pages will show your live dashboard address.

The address will normally look like:
https://YOUR-USERNAME.github.io/fresh-island-display/

## Fully Kiosk
Use the GitHub Pages address as the Fully Kiosk screensaver URL.

## Weather location
The dashboard is configured for postcode LS10 1BL in Leeds.

To change it, open script.js and edit:
LATITUDE
LONGITUDE
LOCATION_NAME

## Important
The weather comes from Open-Meteo and requires internet access.
The Google Inter font also uses internet access. If it cannot load, the dashboard falls back to Arial.

The page is designed at exactly 1280 x 800 and automatically scales down if required.


## Smart background
The background automatically changes with the live conditions:
- clearer warm glow in fair weather
- moving cloud ambience when cloudy
- subtle animated rain when wet
- darker blue, lightly starred ambience at night
- a restrained lightning glow during thunderstorms

Nothing is clickable and the effects are intentionally subtle for a professional clocking-in display.

## Logo update
The supplied vector logo is included with a transparent background and adjusted contrast for the dark display.
