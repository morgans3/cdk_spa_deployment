import cloudfront = require("@aws-cdk/aws-cloudfront");
import cloudfrontweb = require("@aws-cdk/aws-cloudfront/lib/web-distribution");
import route53 = require("@aws-cdk/aws-route53");
import s3 = require("@aws-cdk/aws-s3");
import codepipeline = require("@aws-cdk/aws-codepipeline");
import cpactions = require("@aws-cdk/aws-codepipeline-actions");
import acm = require("@aws-cdk/aws-certificatemanager");
import cdk = require("@aws-cdk/core");
import targets = require("@aws-cdk/aws-route53-targets/lib");
import codebuild = require("@aws-cdk/aws-codebuild");
import { StackProps } from "@aws-cdk/core";
import { Duration } from "@aws-cdk/aws-cloudfront/node_modules/@aws-cdk/core/lib/duration";
import * as secrets from "@aws-cdk/aws-cloudfront/node_modules/@aws-cdk/core/lib/secret-value";
import { cleanseBucketName } from "./microservices";

export interface StaticSiteProps extends StackProps {
  domainName: string;
  siteSubDomain: string;
  application: any;
}

export class SPAPipelines extends cdk.Stack {
  constructor(scope: any, id: string, props: StaticSiteProps) {
    super(scope, id, props);

    const zone = route53.HostedZone.fromLookup(this, "Zone", { domainName: props.domainName });
    const siteDomain = props.siteSubDomain + "." + props.domainName;
    new cdk.CfnOutput(this, "Site", { value: "https://" + siteDomain });

    // Content bucket
    // @ts-ignore
    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      bucketName: cleanseBucketName(props.application.repo + "-" + props.application.name + "-bucket"),
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      publicReadAccess: true,
      cors: [
        {
          allowedOrigins: ["*"],
          allowedMethods: [s3.HttpMethods.GET],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    new cdk.CfnOutput(this, "Bucket", { value: siteBucket.bucketName });

    // TLS certificate
    const certificateArn = new acm.DnsValidatedCertificate(this, "SiteCertificate", {
      domainName: siteDomain,
      hostedZone: zone,
      region: "us-east-1", // Cloudfront only checks this region for certificates.
    }).certificateArn;
    new cdk.CfnOutput(this, "Certificate", { value: certificateArn });

    // CloudFront distribution that provides HTTPS
    const distribution = new cloudfrontweb.CloudFrontWebDistribution(this, "SiteDistribution", {
      aliasConfiguration: {
        acmCertRef: certificateArn,
        names: [siteDomain],
        sslMethod: cloudfront.SSLMethod.SNI,
        securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
      },
      originConfigs: [
        {
          customOriginSource: {
            domainName: siteBucket.bucketWebsiteDomainName,
            originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
    });
    new cdk.CfnOutput(this, "DistributionId", { value: distribution.distributionId });

    // Route53 alias record for the CloudFront distribution
    new route53.ARecord(this, "SiteAliasRecord", {
      recordName: siteDomain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      zone,
    });

    const buildSpecObject = {
      version: "0.2",
      phases: {
        install: {
          commands: "npm install",
        },
        build: {
          commands: ["npm run build-prod"],
        },
      },
      artifacts: {
        "base-directory": "dist",
        files: "**/*",
      },
    };

    const build = new codebuild.PipelineProject(this, props.application.name + "-Build", {
      buildSpec: codebuild.BuildSpec.fromObject(buildSpecObject),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_3_0,
        privileged: true,
        computeType: codebuild.ComputeType.SMALL,
      },
      timeout: Duration.minutes(10),
      projectName: props.application.name + "-Build",
    });

    // Deploy site contents to S3 bucket
    const sourceOutput = new codepipeline.Artifact();
    const buildOutput = new codepipeline.Artifact();
    new codepipeline.Pipeline(this, "Pipeline", {
      pipelineName: props.application.name + "-Pipeline",
      stages: [
        {
          stageName: "Source",
          actions: [
            new cpactions.GitHubSourceAction({
              actionName: "CodeCommit_Source",
              branch: props.application.branch,
              output: sourceOutput,
              repo: props.application.repo,
              owner: props.application.owner,
              oauthToken: secrets.SecretValue.secretsManager("github", {
                jsonField: "oauthToken",
              }),
              trigger: cpactions.GitHubTrigger.WEBHOOK,
            }),
          ],
        },
        {
          stageName: "Build",
          actions: [
            new cpactions.CodeBuildAction({
              actionName: "Build",
              project: build,
              input: sourceOutput,
              outputs: [buildOutput],
            }),
          ],
        },
        {
          stageName: "Deploy",
          actions: [
            new cpactions.S3DeployAction({
              actionName: "S3_Deploy",
              bucket: siteBucket,
              input: buildOutput,
            }),
          ],
        },
      ],
      restartExecutionOnUpdate: true,
    });
  }
}
