#!/bin/bash
set -e

VERSION=${1:-V1}
PORT=3000

if [ "$VERSION" = "V2" ]; then
  COLLECTION="Forum API V2 Test/Forum API V2 Test.postman_collection.json"
  ENVIRONMENT="Forum API V2 Test/Forum API V2 Test.postman_environment.json"
else
  COLLECTION="Forum API V1 Test/Forum API V1 Test.postman_collection.json"
  ENVIRONMENT="Forum API V1 Test/Forum API V1 Test.postman_environment.json"
fi

# Start server in background using test environment
NODE_ENV=test DOTENV_CONFIG_PATH=.test.env node src/app.js &
SERVER_PID=$!

echo "Server started (PID: $SERVER_PID), waiting for ready..."

# Wait until server responds
MAX_WAIT=15
COUNT=0
until nc -z localhost $PORT > /dev/null 2>&1; do
  if [ $COUNT -ge $MAX_WAIT ]; then
    echo "Server did not start in time"
    kill $SERVER_PID 2>/dev/null
    exit 1
  fi
  sleep 1
  COUNT=$((COUNT + 1))
done

echo "Server ready. Running Postman tests..."

# Run newman
npx newman run "$COLLECTION" \
  --environment "$ENVIRONMENT" \
  --env-var "port=$PORT" \
  --color on
NEWMAN_EXIT=$?

# Cleanup
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

exit $NEWMAN_EXIT
