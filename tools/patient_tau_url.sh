#!/bin/bash

# Convert an orders.boson.health URL from the shortlinks table
# to one eng can access for local development

url=$1

if [ -z "$url" ]; then
  echo "Please provide a URL: $0 <url>"
  exit 1
fi

order_id=$(echo "$url" | grep -oE 'orderId=[^&]+' | cut -d= -f2)

if [ -z "$order_id" ]; then
  echo "Error: could not extract orderId from URL"
  exit 1
fi

tau_url=$(echo "http://localhost:3001/?token=$order_id&orderId=$order_id")

echo -e "\nOpening in the browser:\n$tau_url"
open $tau_url
