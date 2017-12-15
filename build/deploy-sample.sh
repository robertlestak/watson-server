#!/bin/sh

echo Deploying to remote...

ssh -o StrictHostKeyChecking=no build@remote.server sh '~/watson-server/build/deploy-remote.sh'
