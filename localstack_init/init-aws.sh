#!/bin/bash
echo "Initializing LocalStack resources..."

# Create Cognito User Pool
awslocal cognito-idp create-user-pool --pool-name betterhr-users

# Create Cognito Client
awslocal cognito-idp create-user-pool-client --user-pool-id $(awslocal cognito-idp list-user-pools --query "UserPools[?Name=='betterhr-users'].Id" --output text) --client-name betterhr-web-client

# Create S3 Bucket
awslocal s3 mb s3://betterhr-documents

echo "LocalStack initialization complete."
