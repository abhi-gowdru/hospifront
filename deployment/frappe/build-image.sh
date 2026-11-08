#!/usr/bin/env bash
# Builds the custom Frappe image containing ERPNext + Frappe Health (Marley).
#
# Apps baked into the image (see apps.json):
#   - erpnext  version-15   (Marley declares required_apps = ["frappe/erpnext"])
#   - marley   version-15   (the app installs as "healthcare")
# Frappe framework itself is pinned by FRAPPE_BRANCH below.
set -euo pipefail

FRAPPE_BRANCH="${FRAPPE_BRANCH:-version-15}"
IMAGE_TAG="${IMAGE_TAG:-hims-frappe:v15}"
WORKDIR="$(mktemp -d)"

echo "▸ Cloning frappe_docker (build tooling)…"
git clone --depth 1 https://github.com/frappe/frappe_docker "${WORKDIR}/frappe_docker"

cp "$(dirname "$0")/apps.json" "${WORKDIR}/frappe_docker/apps.json"

echo "▸ Building ${IMAGE_TAG} (this takes 15–30 minutes the first time)…"
docker build \
  --build-arg="FRAPPE_BRANCH=${FRAPPE_BRANCH}" \
  --secret id=apps_json,src=apps.json \
  --tag "${IMAGE_TAG}" \
  --file images/custom/Containerfile \
  "${WORKDIR}/frappe_docker"

rm -rf "${WORKDIR}"
echo "✔ Built ${IMAGE_TAG} with frappe@${FRAPPE_BRANCH} + erpnext@version-15 + healthcare@version-15"
