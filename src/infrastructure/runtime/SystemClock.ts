import type { ClockPort } from "../../application/ports/runtime";

export class SystemClock implements ClockPort {
  now(): Date {
    return new Date();
  }
}
