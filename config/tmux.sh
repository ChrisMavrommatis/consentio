#!/bin/bash

SESSION_NAME="consentio"

# if session doesnt exist
if ! tmux has-session -t $SESSION_NAME 2>/dev/null; then
	# Create a new session named $SESSION_NAME with a window named 'core'
	tmux new-session -d -s $SESSION_NAME -n 'core'
	
	###-------------------------WINDOW 0----------------------------###
	# split the 1st window horizontally
	tmux split-window -h -t $SESSION_NAME:0 

	# Select the first pane
	tmux select-pane -t $SESSION_NAME:0.0
	###-------------------------WINDOW 0----------------------------###
	
  # Select the first window 
  tmux select-window -t $SESSION_NAME:0
fi

# Finally attach to the session
tmux attach -t $SESSION_NAME

