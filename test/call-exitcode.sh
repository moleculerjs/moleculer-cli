#!/bin/sh

node ./bin/moleculer call --ns multi -t NATS "math.add" --@a 5 --@b 3

RESULT=$?

echo "Done: $RESULT"

exit $RESULT
