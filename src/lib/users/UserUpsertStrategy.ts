import { AddOrUpdateUserResponse } from "../../types/api.js";
import MultisigUpsertStrategy from "./MultisigUpsertStrategy.js";
import EOAUpsertStrategy from "./EOAUpsertStrategy.js";
import { EOAUpdateRequest as EOAUpsertRequest } from "./schemas.js";
import { MultisigUpdateRequest as MultisigUpsertRequest } from "./schemas.js";

export interface UserUpsertStrategy {
  execute(): Promise<AddOrUpdateUserResponse>;
}

export function createStrategy(
  address: string,
  request: MultisigUpsertRequest | EOAUpsertRequest,
): UserUpsertStrategy {
  if ("signature" in request) {
    return new EOAUpsertStrategy(address, request);
  }
  return new MultisigUpsertStrategy(address, request);
}