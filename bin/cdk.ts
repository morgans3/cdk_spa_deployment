#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { SPAPipelines } from "../lib/cdk-stack";
import { _ACCOUNT, _AWSREGION } from "../lib/_config";
import { Applications } from "../lib/microservices";

const env = { account: _ACCOUNT, region: _AWSREGION };

const app = new cdk.App();
Applications.forEach((spa) => {
  new SPAPipelines(app, "SPAPipelines", {
    env: env,
    domainName: spa.domainName,
    siteSubDomain: spa.siteSubDomain,
  });
});
