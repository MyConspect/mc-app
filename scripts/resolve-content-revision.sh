#!/usr/bin/env bash
set -euo pipefail

ref="${RESOURCES_GIT_REF:-main}"
url="${RESOURCES_GIT_URL:?RESOURCES_GIT_URL is required}"

clone_url="$url"
if [ -n "${RESOURCES_GIT_TOKEN:-}" ]; then
  clone_url="$(node -e "
    const u = new URL(process.argv[1]);
    u.username = 'x-access-token';
    u.password = process.env.TOKEN;
    console.log(u.toString());
  " "$url" TOKEN="${RESOURCES_GIT_TOKEN}")"
fi

if [[ "$ref" =~ ^[0-9a-f]{40}$ ]]; then
  sha="$ref"
else
  sha="$(git ls-remote "$clone_url" "refs/heads/${ref}" | awk 'NR==1 {print $1}')"
fi

if [ -z "$sha" ]; then
  echo "::error::Could not resolve mc-content revision for ref ${ref}" >&2
  exit 1
fi

echo "sha=${sha}" >> "${GITHUB_OUTPUT:?GITHUB_OUTPUT is required}"
echo "CONTENT_REVISION=${sha}" >> "${GITHUB_ENV:?GITHUB_ENV is required}"
