#!/bin/bash
echo updating mongoclient
npm i --package-lock-only github:/c3pobot/mongoclient
echo updating redisclient
npm i --package-lock-only github:/c3pobot/redisclient
echo updating logger
npm i --package-lock-only github:/c3pobot/logger
echo updating botrequest
npm i --package-lock-only github:/c3pobot/botrequest
