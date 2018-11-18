#!/bin/bash

#	print_node_mods.sh
#	print out node packages to a file
#		just in case
#	CST, 17 Nov 2018

file=$(echo "node_modules_"`date +"%Y-%m-%d_%H-%M"`".txt")
touch $file
npm list --depth=0 > $file 2>&1
echo "" >> $file
find ./node_modules >> $file
