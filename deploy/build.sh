#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
cat source.part*.b64 | base64 --decode > source.tar.gz
echo '0b48ddf83ec9bb7d2bbe9f66bd8410551abcda3b57697daf3dabbe2ff3a83f98  source.tar.gz' | sha256sum --check
mkdir -p app
tar -xzf source.tar.gz -C app
cd app
npm ci --no-audit --no-fund
npm test
CI=false GENERATE_SOURCEMAP=false npm run build
