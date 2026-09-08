#!/usr/bin/env sh

set -e
npm ci
npx playwright install chromium
