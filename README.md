# CDK Project for Deploying SPA to a S3 bucket and hosting via Route 53

Cloud Development Kit project for managing AWS Services for deploying a SPA website from Github.

## Pre-requisites

- AWS Account, IAM with required permissions
- Registered Domain, managed by Route 53
- Github repository with a SPA (for example: an Angluar/React/Vue.js app)
- Stored AWS Credentials which grant programmatic access

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
