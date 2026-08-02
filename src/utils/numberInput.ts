export function parseMoneyInput(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;

  const normalized = trimmed.replace(/\s+/g, "").replace(/[€$£¥]/g, "");
  if (normalized === "") return null;
  if (!/^[0-9,.\-+]+$/.test(normalized)) return null;

  let sign = "";
  let body = normalized;

  if (body.startsWith("+") || body.startsWith("-")) {
    sign = body[0];
    body = body.slice(1);
  }

  if (body === "" || body.includes("+") || body.includes("-")) return null;

  const lastSeparatorIndex = Math.max(body.lastIndexOf(","), body.lastIndexOf("."));
  if (lastSeparatorIndex === -1) {
    return parseFiniteNumber(`${sign}${body}`);
  }

  const integerPart = body.slice(0, lastSeparatorIndex).replace(/[.,]/g, "");
  const fractionalPart = body.slice(lastSeparatorIndex + 1).replace(/[.,]/g, "");

  if (fractionalPart === "") return null;
  if (integerPart === "" && fractionalPart === "") return null;

  const normalizedNumber = `${sign}${integerPart === "" ? "0" : integerPart}.${fractionalPart}`;
  return parseFiniteNumber(normalizedNumber);
}

export function parseOptionalMoneyInput(
  value: string,
): number | undefined | null {
  if (value.trim() === "") return undefined;
  return parseMoneyInput(value);
}

function parseFiniteNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
