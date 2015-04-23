#!/bin/bash

# 1. npm install -g browserify exorcist
# 2. npm install deamdify

browserify -t deamdify src/index.js --debug | exorcist browser.js.map > browser.js