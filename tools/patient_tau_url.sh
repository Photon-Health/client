#!/bin/bash

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

echo -e "\nPATIENT URL:"
echo "http://localhost:3001/?token=$order_id&orderId=$order_id"
