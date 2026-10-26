#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
cat source.part*.b64 | base64 --decode > source.tar.gz
echo '0b48ddf83ec9bb7d2bbe9f66bd8410551abcda3b57697daf3dabbe2ff3a83f98  source.tar.gz' | sha256sum --check
mkdir -p app
tar -xzf source.tar.gz -C app
cp netlify-server.js app/server.js
mkdir -p app/netlify/functions
cp netlify-api.js app/netlify/functions/api.js
cd app
npm ci --no-audit --no-fund
npm install --no-save --package-lock=false --no-audit --no-fund serverless-http@3.2.0
node - <<'JS'
const fs = require('fs');
const p = 'client/src/api.js';
let source = fs.readFileSync(p, 'utf8');
source += String.raw`
api.interceptors.request.use(config => {
  if (/^\/(ledger|clients)(\/|\?|$)/.test(config.url || '')) config.url = '/api' + config.url;
  return config;
});
`;
fs.writeFileSync(p, source);
JS
npm test
CI=false GENERATE_SOURCEMAP=false npm run build
