#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { SPAPipelines } from "../lib/cdk-stack";
import { Applications } from "../lib/microservices";

export const _AWSREGION = process.env.CDK_DEFAULT_REGION;
export const _ACCOUNT = process.env.CDK_DEFAULT_ACCOUNT;
const env = { account: _ACCOUNT, region: _AWSREGION };

const app = new cdk.App();
Applications.forEach((spa) => {
  new SPAPipelines(app, "SPAPipelines-" + spa.name, {
    env: env,
    domainName: spa.domainName,
    siteSubDomain: spa.siteSubDomain,
    application: spa,
  });
});
