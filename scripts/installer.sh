#!/bin/bash

EXT=$1

if [[ "$EXT" == "zip" ]]; then
  if [[ `uname -m` == "x86_64" ]]; then
    ARCH='x64'
  elif [[ `uname -m` == "arm64" ]]; then
    ARCH="arm64"
  fi
elif [[ "$EXT" == "deb" ]]; then
  ARCH='amd64'
elif [[ "$EXT" == "rpm" ]]; then
  ARCH='x86_64'
fi

CURL=$(curl -k -s "https://api.github.com/repos/mbruno46/ToM/releases/latest")

LATEST_VERSION=$(echo $CURL | sed -e 's/.*"tag_name": "v\([^"]*\)".*/\1/')
echo "Latest version $LATEST_VERSION"

SED=`echo 's/.*"browser_download_url": "\([^"]*\)'${ARCH}'.'${EXT}'".*/\1/'`
URL=$(echo $CURL | sed -e "${SED}")${ARCH}.$EXT

SED=`echo 's/.*"name": "\([^"]*\)'${ARCH}'.'${EXT}'".*/\1/'`
NAME=$(echo $CURL | sed -e "${SED}")${ARCH}.${EXT}

cd /tmp
curl -L -O -k $URL

echo Installing $NAME

if [[ "$EXT" == "zip" ]]
then
  unzip -q $NAME

  DEST="$HOME/Applications/ToM.app"
  if [ -d $DEST ]; then rm -r $DEST; fi
  mv ToM.app $DEST
  xattr -dr com.apple.quarantine $DEST
elif [[ "$EXT" == "deb" ]]
then
  sudo apt install -y ./$NAME
elif [[ "$EXT" == "rpm" ]]
then
  rpm -i ./$NAME
fi

rm $NAME
echo Done