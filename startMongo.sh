#!/usr/bin/env bash
sudo sysctl -w kern.maxfiles=64000
sudo sysctl -w kern.maxfilesperproc=64000
ulimit -n 64000
mongod --dbpath db --quiet