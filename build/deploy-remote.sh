#!/bin/sh

## watson-server deployment

## Ensure server has access to git repository, then git clone in home directory (~/).

cd ~/watson-server && \
  echo Pulling from git... && \
  git fetch --all --depth=1 && \
  git reset --hard origin/master && \
  git submodule update --init --recursive && \
  echo Installing dependencies... && \
  yarn install && \
  echo Configuring submodules... && \
  yarn run config && \
  echo Deploying with docker-compose... && \
  docker-compose -f docker-compose.yml -f docker-compose.proxy.yml up -d --build && \
  echo Deployment Complete
