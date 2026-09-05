import type { RecordModel } from "pocketbase";

export type User = RecordModel & {
  name: string;
  email: string;
};
