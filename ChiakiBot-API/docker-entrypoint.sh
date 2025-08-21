#!/bin/sh
set -e

# acelera ts-node (sem type-check no runtime)
export TS_NODE_TRANSPILE_ONLY=1

# força o moduleResolution adequado para quem usa "module":"NodeNext"
export TS_NODE_COMPILER_OPTIONS='{"moduleResolution":"NodeNext"}'

echo "Running database migrations..."
npm run migration:run

echo "Starting application..."
node build/main