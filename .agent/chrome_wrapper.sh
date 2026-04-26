#!/bin/bash
export WAYLAND_DISPLAY=wayland-0
export XDG_RUNTIME_DIR=/run/user/1000
# Only use headless if we are in a non-GUI environment, 
# but the user seems to have a GUI. 
# Antigravity will likely pass its own flags.
exec /usr/local/bin/chrome --ozone-platform=wayland --enable-features=WaylandWindowDecorations "$@"
