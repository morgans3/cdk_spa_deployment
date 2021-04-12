import cloudfront = require("@aws-cdk/aws-cloudfront");
import route53 = require("@aws-cdk/aws-route53");
import s3 = require("@aws-cdk/aws-s3");
import s3deploy = require("@aws-cdk/aws-s3-deployment");
import acm = require("@aws-cdk/aws-certificatemanager");
import cdk = require("@aws-cdk/core");
import targets = require("@aws-cdk/aws-route53-targets/lib");
import { _ACCOUNT } from "./_config";
import { StackProps } from "@aws-cdk/core";

export interface StaticSiteProps extends StackProps {
  domainName: string;
  siteSubDomain: string;
}

export class SPAPipelines extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StaticSiteProps) {
    super(scope, id, props);

    const zone = route53.HostedZone.fromLookup(this, "Zone", { domainName: props.domainName });
    const siteDomain = props.siteSubDomain + "." + props.domainName;
    new cdk.CfnOutput(this, "Site", { value: "https://" + siteDomain });
    // code here
  }
}
