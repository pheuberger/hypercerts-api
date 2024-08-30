import {
  BooleanSearchOptions,
  IdSearchOptions,
  NumberArraySearchOptions,
  NumberSearchOptions,
  StringArraySearchOptions,
  StringSearchOptions,
} from "./searchOptions.js";
import type { BasicContractWhereInput } from "./contractInput.js";
import type { BasicFractionWhereInput } from "./fractionInput.js";
import type { BasicMetadataWhereInput } from "./metadataInput.js";
import type { BasicHypercertWhereArgs } from "./hypercertsInput.js";

export type WhereOptions<T extends object> = {
  [P in keyof T]:
    | IdSearchOptions
    | BooleanSearchOptions
    | StringSearchOptions
    | NumberSearchOptions
    | StringArraySearchOptions
    | NumberArraySearchOptions
    | BasicMetadataWhereInput
    | BasicHypercertWhereArgs
    | BasicContractWhereInput
    | BasicFractionWhereInput
    | null;
};
