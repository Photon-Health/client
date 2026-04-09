test_aws_sso_specific() {
    local profile=$1
    
    echo "Checking if already logged in to AWS SSO for $profile profile..."
    if aws sts get-caller-identity --profile "$profile" >/dev/null 2>&1; then
        local account_id=$(aws sts get-caller-identity --profile "$profile" --query "Account" --output text)
        local user_arn=$(aws sts get-caller-identity --profile "$profile" --query "Arn" --output text)
        echo "Already logged in to AWS SSO for $profile profile"
        return 0
    else
        echo "Not logged in to AWS SSO for $profile profile. Attempting login..."
        echo "This will open a browser window for authentication..."
        
        if aws sso login --profile "$profile" >/dev/null 2>&1; then
            echo "Successfully logged in to AWS SSO for $profile profile"
        else
            echo "SSO login failed or was cancelled for $profile profile"
            echo "You may need to manually run: aws sso login --profile $profile"
            return 1
        fi
    fi
}

test_aws_sso_specific $1
secret=$(AWS_PROFILE=$1 aws secretsmanager get-secret-value --secret-id $2 --query SecretString --output text) || exit 1
echo "$secret" | jq -r 'to_entries[] | "\(.key)=\(.value)"' > .env || exit 1
echo "\nSuccessfully downloaded .env"
exit 0