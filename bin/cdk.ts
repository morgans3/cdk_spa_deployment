#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import { SPAPipelines } from "../lib/cdk-stack";
import { _ACCOUNT, _AWSREGION } from "../lib/_config";

const env = { account: _ACCOUNT, region: _AWSREGION };

const app = new cdk.App();
new SPAPipelines(app, "SPAPipelines", {
  env: env,
});
