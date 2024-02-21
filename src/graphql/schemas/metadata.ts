import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { schemaFromExecutor } from "@graphql-tools/wrap";
import { assertExists } from "../../utils/assertExists.js";

const remoteExecutor = buildHTTPExecutor({
  endpoint: "https://icidusuyshxkefjmqccr.supabase.co/graphql/v1",
  headers: {
    apiKey: assertExists(
      process.env.SUPABASE_HC_METADATA_API_KEY,
      "SUPABASE_HC_METADATA_API_KEY"
    ),
  },
});

export const metadataSubschema = {
  schema: await schemaFromExecutor(remoteExecutor),
  executor: remoteExecutor,
};
