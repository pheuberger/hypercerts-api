import {
  Args,
  FieldResolver,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { AttestationSchema } from "../typeDefs/attestationSchemaTypeDefs.js";
import { GetAttestationSchemasArgs } from "../args/attestationSchemaArgs.js";
import { createBaseResolver, DataResponse } from "./baseTypes.js";

@ObjectType()
class GetAttestationsSchemaResponse extends DataResponse(AttestationSchema) {}

const AttestationSchemaBaseResolver = createBaseResolver("attestationSchema");

@Resolver(() => AttestationSchema)
class AttestationSchemaResolver extends AttestationSchemaBaseResolver {
  @Query(() => GetAttestationsSchemaResponse)
  async attestationSchemas(@Args() args: GetAttestationSchemasArgs) {
    const res = await this.getAttestationSchemas(args);

    const data = Array.isArray(res) ? res : [];

    return { data, count: data.length };
  }

  @FieldResolver({ nullable: true })
  async records(@Root() schema: Partial<AttestationSchema>) {
    return await this.getAttestations({
      where: { supported_schemas_id: { eq: schema.id } },
    });
  }
}

export { AttestationSchemaResolver };
