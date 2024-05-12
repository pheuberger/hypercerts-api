import {Args, Field, FieldResolver, Int, ObjectType, Query, Resolver, Root} from "type-graphql";
import {inject, injectable} from "tsyringe";
import {SupabaseService} from "../../../services/SupabaseService.js";
import {GetAttestationArgs} from "../args/attestationArgs.js";
import {Attestation} from "../typeDefs/attestationTypeDefs.js";

@ObjectType()
export default class GetAttestationsResponse {
    @Field(() => [Attestation], {nullable: true})
    data?: Attestation[];

    @Field(() => Int, {nullable: true})
    count?: number;
}

@injectable()
@Resolver(_ => Attestation)
class AttestationResolver {

    constructor(
        @inject(SupabaseService)
        private readonly supabaseService: SupabaseService) {
    }

    @Query(_ => GetAttestationsResponse)
    async attestations(@Args() args: GetAttestationArgs) {
        try {
            const res = await this.supabaseService.getAttestations(args);

            const {data, error, count} = res;

            if (error) {
                console.warn(`[AttestationResolver] Error fetching attestations: `, error);
                return {data, count: null};
            }

            const newData = data ? data.map(item => {
                return {
                    ...item,
                    attestation: item.decoded_attestation ? JSON.parse(item.decoded_attestation as string) : item.attestation,
                };
            }) : data;

            return {data: newData, count: count ? count : newData?.length};
        } catch (e) {
            const error = e as Error;
            throw new Error(`[AttestationResolver] Error fetching attestations: ${error.message}`)
        }
    }

    @FieldResolver({nullable: true})
    async hypercerts(@Root() attestation: Attestation) {
        if (!attestation.attestation) return null;

        const _att = attestation.attestation;

        if (!isHypercertPointer(_att)) return null;

        try {
            const res = await this.supabaseService.getHypercerts({
                where: {
                    contracts: {chain_id: {eq: BigInt(_att.chain_id)}, contract_address: {eq: _att.contract_address}},
                    token_id: {eq: BigInt(_att.token_id)}
                }
            })

            if (!res) {
                console.warn(`[AttestationResolver] Error fetching hypercerts: `, res);
                return null;
            }

            const {data, error} = res;

            if (error) {
                console.warn(`[AttestationResolver] Error fetching hypercerts: `, error);
                return null;
            }

            return data;
        } catch (e) {
            const error = e as Error;
            throw new Error(`[AttestationResolver] Error fetching hypercerts: ${error.message}`)
        }
    }
}

function isHypercertPointer(obj: any): obj is { chain_id: string, contract_address: string, token_id: string } {
    return obj && typeof obj.chain_id === 'string' && typeof obj.contract_address === 'string' && typeof obj.token_id === 'string';
}

export {
    AttestationResolver
};