import { handlerPath } from "@libs/handler-resolver";
import type { AwsFunction } from "@libs/lambda";

export const hello: AwsFunction = {
  handler: `${handlerPath(__dirname)}/handler.main`,
};
