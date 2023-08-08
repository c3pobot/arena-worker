#!/bin/bash
echo updating mongoapiclient
npm i --package-lock-only github:/c3pobot/mongoapiclient
echo updating redisclient
npm i --package-lock-only github:/c3pobot/redisclient
echo updating logger
npm i --package-lock-only github:/c3pobot/logger
echo updating botrequest
npm i --package-lock-only github:/c3pobot/botrequest
