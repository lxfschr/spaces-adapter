#!/bin/bash

# 1. npm install -g browserify exorcist
# 2. npm install

browserify src/index.js --debug | exorcist browser.js.map > browser.js
