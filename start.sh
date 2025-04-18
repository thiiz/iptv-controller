#!/bin/bash

if [ ! -f .env ]; then
  echo "Creating .env file from example..."
  cp .env.example .env
fi

echo "Installing dependencies..."
npm install

echo "Starting IPTV Controller API..."
npm start 