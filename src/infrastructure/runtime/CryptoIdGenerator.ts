import type { IdGeneratorPort } from "../../application/ports/runtime";

export class CryptoIdGenerator implements IdGeneratorPort {
  generateId(): string {
    const randomUUID = globalThis.crypto?.randomUUID;

    if (typeof randomUUID === "function") {
      return randomUUID.call(globalThis.crypto);
    }

    return `id_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 12)}`;
  }
}
