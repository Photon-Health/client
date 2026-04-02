#!/usr/bin/env bash

secret_id=$1

secret=$(aws secretsmanager get-secret-value --secret-id "${secret_id}" --query SecretString --output text)
client_id=$(echo "$secret" | jq -r '.GITHUB_CLIENT_ID')
installation_id=$(echo "$secret" | jq -r '.GITHUB_APP_INSTALLATION_ID')
private_key=$(echo "$secret" | jq -r '.GITHUB_APP_PRIVATE_KEY')

# Copied from https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-json-web-token-jwt-for-a-github-app#example-using-bash-to-generate-a-jwt
generate_jwt() {
    local client_id=$1
    local private_key=$2

    b64enc() { openssl base64 | tr -d '=' | tr '/+' '_-' | tr -d '\n'; }

    local now
    now=$(date +%s)
    local iat=$((now - 60)) # Issues 60 seconds in the past
    local exp=$((now + 600)) # Expires 10 minutes in the future

    local header_json='{
        "typ":"JWT",
        "alg":"RS256"
    }'
    # Header encode
    local header
    header=$( echo -n "${header_json}" | b64enc )

    local payload_json="{
        \"iat\":${iat},
        \"exp\":${exp},
        \"iss\":\"${client_id}\"
    }"
    # Payload encode
    local payload
    payload=$( echo -n "${payload_json}" | b64enc )

    # Signature
    local header_payload="${header}"."${payload}"
    local tmp_key=$(mktemp)
    printf '%b' "${private_key}" > "${tmp_key}"
    local signature
    signature=$(
        echo -n "${header_payload}" | openssl dgst -sha256 -sign "${tmp_key}" | b64enc
    )
    rm -f "${tmp_key}"

    # Create JWT
    printf '%s' "${header_payload}"."${signature}"
}

JWT=$(generate_jwt "${client_id}" "${private_key}")

response=$(curl --request POST \
--url "https://api.github.com/app/installations/${installation_id}/access_tokens" \
--header "Accept: application/vnd.github+json" \
--header "Authorization: Bearer ${JWT}" \
--header "X-GitHub-Api-Version: 2026-03-10")

token=$(echo "${response}" | jq -r '.token')

if [ -z "${token}" ] || [ "${token}" = "null" ]; then
    echo "Error: failed to obtain GitHub access token. Response: ${response}" >&2
    exit 1
fi

echo "${token}"
