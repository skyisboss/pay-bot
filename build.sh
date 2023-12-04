#!/usr/bin/env bash

rm -rf dist
mkdir dist dist/i18n
cp -avx ./src/i18n/* ./dist/i18n/
pnpm tsc && tsc-alias