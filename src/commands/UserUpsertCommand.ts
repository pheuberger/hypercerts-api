import { isTypedMessage } from "../lib/safe-signatures.js";
import {
  MultisigUserUpdateMessage,
  USER_UPDATE_MESSAGE_SCHEMA,
} from "../lib/users/schemas.js";
import { SupabaseDataService } from "../services/SupabaseDataService.js";

import { SafeApiCommand } from "./SafeApiCommand.js";

type SignatureRequest = Awaited<
  ReturnType<SupabaseDataService["getSignatureRequest"]>
>;

export class UserUpsertCommand extends SafeApiCommand {
  async execute(): Promise<void> {
    const signatureRequest = await this.dataService.getSignatureRequest(
      this.safeAddress,
      this.messageHash,
    );

    if (signatureRequest?.status !== "pending") {
      return;
    }

    const safeInfo = await this.safeApiKit.getSafeInfo(this.safeAddress);
    const safeMessage = await this.safeApiKit.getMessage(this.messageHash);

    if (safeMessage.confirmations.length < safeInfo.threshold) {
      return;
    }

    if (!isTypedMessage(safeMessage.message)) {
      throw new Error("Unexpected message type: not EIP712TypedData");
    }

    const message = USER_UPDATE_MESSAGE_SCHEMA.safeParse(
      safeMessage.message.message,
    );
    if (message.success) {
      await this.upsertUser(signatureRequest, message.data);
    } else {
      console.log("Unexpected message format", message.error);
      throw new Error("Unexpected message format");
    }
  }

  async upsertUser(
    signatureRequest: Exclude<SignatureRequest, undefined>,
    message: MultisigUserUpdateMessage,
  ): Promise<void> {
    const users = await this.dataService.upsertUsers([
      {
        address: this.safeAddress,
        chain_id: signatureRequest.chain_id,
        display_name: message.user.displayName,
        avatar: message.user.avatar,
      },
    ]);
    if (!users.length) {
      throw new Error("Error adding or updating user");
    }
    await this.dataService.updateSignatureRequestStatus(
      this.safeAddress,
      this.messageHash,
      "executed",
    );
    console.log(
      `Signature request executed for ${this.safeAddress}-${this.messageHash}`,
    );
  }
}
