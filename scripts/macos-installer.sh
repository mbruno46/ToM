#!/bin/bash

REPO="https://github.com/mbruno46/ToM/"

LATEST_RELEASE=$(curl -L -s -H 'Accept: application/json' ${REPO}/releases/latest)

LATEST_VERSION=$(echo $LATEST_RELEASE | sed -e 's/.*"tag_name":"v\([^"]*\)".*/\1/')
echo "Latest version $LATEST_VERSION"

FILE="ToM-${LATEST_VERSION}-darwin-x64.zip"
URL="${REPO}/releases/download/v$LATEST_VERSION/${FILE}"

cd /tmp/
curl -L -O $URL

unzip -q $FILE

DEST="$HOME/Applications/ToM.app"
if [ -d $DEST ]; then
  rm -r $DEST
fi

mv ToM.app $DEST
xattr -dr com.apple.quarantine $DEST

rm $FILE