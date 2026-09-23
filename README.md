# Dental Shade Selection

Image-based shade estimation with independently sampled cervical, middle and incisal regions.

## Run and verify

```sh
npm install
npm test
npm run lint
npm run build
npm start
```

Development: `npm run dev`. Configure `GEMINI_API_KEY` on the server only. AI failures are reported as errors; local color matching remains available. A missing key does not produce a substitute analysis.

GitHub Pages can host the built frontend but cannot execute `server.ts`. For separate API hosting, set `VITE_API_BASE_URL` at frontend build time and `FRONTEND_ORIGIN` to the exact frontend origin on the API server. Same-origin Node hosting needs neither setting. The API must be reachable over HTTPS when the frontend uses HTTPS. This change does not deploy an API service.

## Measurement workflow

1. Upload a photo and enter the patient identifier and tooth number. Uploading resets all samples, calibration, capture confirmations and AI state.
2. If available, select a known 18% gray reference patch. Correction is applied in linear sRGB, with all region samples retained in their raw form.
3. Choose each tooth region and click its actual location in the photo. Markers are separate HTML overlays, never sampled pixels. Unmeasured regions remain unknown.
4. Review the matches and actual capture checklist. Cross-polarization is a user-reported capture condition, not a software filter.
5. Export the report. Illustrated reference examples are explicitly marked as demos. Reports do not invent translucency indices, morphology or firing schedules.

The preview preserves aspect ratio and is capped at 2400 pixels on its longest side. Measurements are taken from that decoded preview, not RAW camera data. Gray-reference correction alone does not validate camera color accuracy. Existing shade-reference coordinates and material planning heuristics still require independent clinical validation. Match proximity is not a probability or diagnostic confidence.

## Regression coverage

`npm test` runs the original retained numerical/lifecycle checks and additional tests for independent regional sampling, empty measurements, upload/reset and stale-request handling, linear calibration, threshold boundaries, report provenance, clipped sampling windows, AI schema rejection and missing-key server behavior. Live Gemini calls and browser visual checks are separate integration checks.
