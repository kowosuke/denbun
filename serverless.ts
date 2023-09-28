import type { AWS, AwsResourceTags } from "@serverless/typescript";

import * as functions from "@functions";

//タグ定義
const tags: AwsResourceTags = {
  Service: "ServerlessFramework",
  MailAddress: "serverless.template@example.com", //TODO: プロジェクト毎に修正
  Project: "ServerlessTemplate", //TODO: プロジェクト毎に修正
  CmBillingGroup: "ServerlessTemplate", //TODO: プロジェクト毎に修正
  ManagedBy: "CloudFormation",
  Environment: "${self:provider.stage}",
};
const resourceTags = Object.keys(tags).map((key) => ({
  Key: key,
  Value: tags[key],
}));

const serverlessConfiguration: AWS = {
  service: "serverless-appsync-template",
  frameworkVersion: "3",
  useDotenv: true,
  provider: {
    name: "aws",
    profile: "${env:PROFILE, 'default'}",
    runtime: "nodejs14.x",
    region: "ap-northeast-1",
    stage: '${opt:stage, "dev"}',
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      TZ: "Asia/Tokyo",
    },
    logRetentionInDays: 365, //TODO: プロジェクト毎に修正
    //リソース名称設定
    stackName: "${self:service}-${self:provider.stage}-stack",
    deploymentBucket: {
      name: "${self:service}-${self:provider.stage}-sls-deploy",
    },
    tags: tags,
  },
  // import the function via paths
  functions: functions,
  package: { individually: true },
  plugins: [
    "serverless-esbuild",
    "serverless-layers",
    "serverless-prune-plugin",
    "serverless-dynamodb-local",
    "serverless-appsync-plugin",
    "serverless-appsync-simulator",
    "serverless-offline",
  ],
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    prune: {
      automatic: true,
      number: 3,
    },
    "serverless-offline": {
      host: '${env:OFFLINE_HOST, "localhost"}',
      httpPort: "${env:OFFLINE_API_PORT, 5000}",
      stage: "${self:provider.stage}",
      apiKey: '${env:OFFLINE_API_KEY, "serverless-local"}',
    },
    dynamodb: {
      stages: ["dev"],
      start: {
        inMemory: true,
        migrate: true,
        seed: true,
      },
      seed: {
        dev: {
          sources: [
            {
              table: "${self:service}-${self:provider.stage}-sample",
              sources: ["./.dynamodb/migrations/sample.json"],
            },
          ],
        },
      },
    },
    appSync: {
      name: "${self:service}-graphql-${self:provider.stage}",
      schema: "schema.graphql",
      authenticationType: "API_KEY",
      dataSources: [
        {
          type: "AMAZON_DYNAMODB",
          name: "sample",
          description: "サンプルテーブル",
          config: {
            tableName: "${self:service}-${self:provider.stage}-sample",
            region: "${aws:region}",
            serviceRoleArn:
              "arn:aws:iam::${aws:accountId}:role/${self:service}-${self:provider.stage}-appsync-dynamodb-role",
          },
        },
        {
          type: "AWS_LAMBDA",
          name: "helloLambda",
          config: {
            functionName: "hello",
          },
        },
      ],
      mappingTemplatesLocation: "src/mapping-templates",
      mappingTemplates: [
        {
          dataSource: "sample",
          type: "Sample",
          field: "child",
        },
        {
          dataSource: "sample",
          type: "Query",
          field: "hello",
        },
        {
          dataSource: "sample",
          type: "Query",
          field: "helloList",
        },
        {
          dataSource: "helloLambda",
          type: "Query",
          field: "helloLambda",
          request: false,
          response: false,
        },
        {
          dataSource: "sample",
          type: "Mutation",
          field: "create",
        },
      ],
      domain: {
        name: "${self:custom.endpoint.${self:provider.stage}}",
        certificateArn: "${env:CUSTOM_DOMAIN_ACM_ARN}",
      },
      wafConfig: {
        enabled: true,
        arn: "${env:WAF_ARN}",
      },
      tags: tags,
    },
    "appsync-simulator": {
      apiKey: "da2-fakeApiId123456",
      watch: ["serverless.ts", "*.graphql", "*.vtl"],
    },
    endpoint: {
      dev: "dev-${self:service}-api.hit-sol.net",
      stg: "stg-${self:service}-api.hit-sol.net",
      prod: "${self:service}-api.hit-sol.net",
    },
  },
  //その他AWSリソース設定（DynamoDBなど）
  resources: {
    Description: "Serverless AppSync Template - ${self: provider.stage}",
    Resources: {
      sampleTable: {
        Type: "AWS::DynamoDB::Table",
        DeletionPolicy: "Retain",
        Properties: {
          TableName: "${self:service}-${self:provider.stage}-sample",
          AttributeDefinitions: [
            {
              AttributeName: "key1",
              AttributeType: "S",
            },
            {
              AttributeName: "key2",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "key1",
              KeyType: "HASH",
            },
            {
              AttributeName: "key2",
              KeyType: "RANGE",
            },
          ],
          BillingMode: "PAY_PER_REQUEST",
          Tags: resourceTags,
        },
      },
      AppSyncDynamoDBServiceRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          RoleName: "${self:service}-${self:provider.stage}-appsync-dynamodb-role",
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: {
                  Service: ["appsync.amazonaws.com"],
                },
                Action: ["sts:AssumeRole"],
              },
            ],
          },
          Policies: [
            {
              PolicyName: "dynamo-policy",
              PolicyDocument: {
                Version: "2012-10-17",
                Statement: [
                  {
                    Effect: "Allow",
                    Action: [
                      "dynamodb:Query",
                      "dynamodb:BatchWriteItem",
                      "dynamodb:GetItem",
                      "dynamodb:DeleteItem",
                      "dynamodb:PutItem",
                      "dynamodb:Scan",
                      "dynamodb:UpdateItem",
                    ],
                    Resource: [
                      "arn:aws:dynamodb:${aws:region}:${aws:accountId}:table/${self:service}-${self:provider.stage}-sample",
                    ],
                  },
                ],
              },
            },
          ],
          Tags: resourceTags,
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
