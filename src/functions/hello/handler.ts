import type { AppSyncResolverHandler } from "aws-lambda";
import type { QueryHelloLambdaArgs, HelloLambda } from "src/types/graphql";

export const main: AppSyncResolverHandler<QueryHelloLambdaArgs, HelloLambda> = async (event) => {
  return {
    message: `Hello ${event.arguments.name}! Appsync Lambda`,
  };
};
