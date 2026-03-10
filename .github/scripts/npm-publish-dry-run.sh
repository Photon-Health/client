#!/usr/bin/env bash
set -euo pipefail

PACKAGES=(packages/sdk packages/react packages/elements)

echo "Building publishable packages..."
npx nx run-many --targets=build --projects=sdk,react,elements

echo ""
echo "Running npm pack --dry-run..."
for PACKAGE_DIR in "${PACKAGES[@]}"; do
  PACKAGE_NAME=$(node -p "require('./$PACKAGE_DIR/package.json').name")
  PRIVATE=$(node -p "require('./$PACKAGE_DIR/package.json').private || false")

  if [ "$PRIVATE" = "true" ]; then
    echo "Skipping $PACKAGE_NAME (private)"
    continue
  fi

  echo "::group::Dry run pack $PACKAGE_NAME"
  cd "$PACKAGE_DIR"
  npm pack --dry-run
  cd - > /dev/null
  echo "::endgroup::"
done