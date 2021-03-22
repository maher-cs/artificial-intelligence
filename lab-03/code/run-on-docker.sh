#!/bin/bash

# UQU - Computer Science -  Artificial Inteligence - Lab 3
# Student: MHD Maher Azkoul

# This script run the script on a docker container
# Docker should be installed on the system in order for this script to work
# 
# This script recieves an argument that determine the programming language and the script
# for now it supports one option [javascript]
# the defaul option is javascript
# 
# usage: SCRIPT_NAME [PROGRAMMING_LANGUAGE]
# where PROGRAMMING_LANGUAGE = javascript

DEFAULT_OPTIONS="-vl 20"

if [[ ${1} = '--help' ]]
	then
        echo "This script run the script on a docker container"
        echo "usage: ${0} [PROGRAMMING_LANGUAGE]"
        echo "where PROGRAMMING_LANGUAGE = javascript"
        echo "the defaul option is javascript"
        echo "for now, only javascript is supported"
        exit 0
    fi

if [[ ${1} = 'javascript' ]]
    then
        echo "running using nodejs"
        docker run -it --rm --name ai-lab-01-nodejs -v "$PWD":/usr/src/myapp -w /usr/src/myapp node node script.js ${DEFAULT_OPTIONS}
        echo "=========="
        exit 0
    
    # default
    else
        echo "running using nodejs"
        docker run -it --rm --name ai-lab-01-nodejs -v "$PWD":/usr/src/myapp -w /usr/src/myapp node node script.js ${DEFAULT_OPTIONS}
        echo "=========="
        exit 0
fi