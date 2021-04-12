# CDK Project for Deploying SPA to a S3 bucket and hosting via Route 53

Cloud Development Kit project for managing AWS Services for deploying a SPA website from Github.

## Pre-requisites

- An AWS Account, with an IAM with required permissions to use CDK
- A registered Domain, managed by Route 53
- Github repository with a SPA Web application (for example: an Angluar/React/Vue.js app)
- Github OAuth credentials (https://github.com/settings/tokens) stored in AWS Secrets Manager with a secret called "github" in this format: `{ "oauthToken": "YOURAUTHKEYFROMGITHUB" }`
- Locally stored AWS Credentials which grant programmatic access, created in AWS IAM

## Steps to deploy

- After downloading the repo, run the command `npm i` to install the node_modules file
- In the terminal, run `npm run watch' to watch and compile changes
- Update lib/microservices.ts file to point to your Github repository and the domain you wish to host the application on
- Run `cdk bootstrap' to bootstrap your AWS account
- Run `cdk deploy` to deploy all the resources
- View your website in your browser

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

### Common Issues

#### Multiple locally stored AWS credentials

If you have multiple locally stored AWS credentials, or if you are not sure that you have a key stored with progammatic access, you should check your local machine:

- Linux and macOS: `~/.aws/config` or `~/.aws/credentials`
- Windows: `%USERPROFILE%\.aws\config` or `%USERPROFILE%\.aws\credentials`

To select a non-default account, run the cdk commands with the profile flag on the end like so `cdk bootstrap --profile myprofilename`

#### CDK Deploy failing during Pipeline deployment

This is typically an issue with connecting to your Github repository. Please ensure that you have the following:

- In AWS Secrets Manager, you should have a secret called "github" that has a key/value pair of `{ "oauthToken": "YOURAUTHKEYFROMGITHUB" }`
- In GitHub, ensure that you have created a key with admin:repo_hook and repo permissions selected. The Personal Access token can be checked here: https://github.com/settings/tokens
- That your repository has a branch called "main". If your branch is called by another name, change the branch name in the GitHubSourceAction in lib/cdk-stack.ts
