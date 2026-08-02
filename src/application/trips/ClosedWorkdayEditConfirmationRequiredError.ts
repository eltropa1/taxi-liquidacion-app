export class ClosedWorkdayEditConfirmationRequiredError extends Error {
  readonly workdayId: number;
  readonly workdayStartTime: string;

  constructor(params: { workdayId: number; workdayStartTime: string }) {
    super(
      "Esta jornada ya está cerrada. Debes confirmar el cambio explícitamente.",
    );
    this.name = "ClosedWorkdayEditConfirmationRequiredError";
    this.workdayId = params.workdayId;
    this.workdayStartTime = params.workdayStartTime;
  }
}
