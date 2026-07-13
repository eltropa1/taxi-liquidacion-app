import type { RecordOwner } from "../../../domain/records";

export interface RecordOwnerResolverPort {
  exists(owner: RecordOwner): Promise<boolean>;
}
