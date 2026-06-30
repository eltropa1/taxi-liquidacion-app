export class TripDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TripDomainError";
  }
}
