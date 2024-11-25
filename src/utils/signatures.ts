import type { EIP712TypedData } from "@safe-global/api-kit";

export function isTypedMessage(
  message: string | EIP712TypedData,
): message is EIP712TypedData {
  return typeof message === "object" && "types" in message;
}
