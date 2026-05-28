#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
FTP_HOST="balancingthecosmos.com"
FTP_DIR="public_html/collab"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌  Missing .env — create it with your FTP credentials (see README)."
  exit 1
fi

echo "🚀  Deploying to $FTP_HOST/$FTP_DIR ..."

while IFS= read -r -d '' file; do
  relative="${file#"$SCRIPT_DIR"/}"
  echo "    ↑ $relative"
  curl -s --insecure --netrc-file "$ENV_FILE" \
    --ftp-create-dirs \
    -T "$file" \
    "ftp://$FTP_HOST/$FTP_DIR/$relative"
done < <(find "$SCRIPT_DIR" -type f \
  ! -path "*/.git/*" \
  ! -path "*/.claude/*" \
  ! -name ".env" \
  ! -name ".gitignore" \
  ! -name "deploy.sh" \
  -print0)

echo "✅  Done — https://balancingthecosmos.com/collab/"
