const fs = require('fs');

const wizardCode = fs.readFileSync('src/components/GuidedFlowWizard.tsx', 'utf8');

// I'll manually create the files with the right props instead of doing string manipulation in JS.
