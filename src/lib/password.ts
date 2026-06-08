import { createHash, timingSafeEqual } from "node:crypto";

export function verifyAdminPassword(password: string, expectedHash?: string | null, developmentPassword?: string | null) {
  if (expectedHash) {
    return verifyPasswordHash(password, expectedHash);
  }

  if (process.env.NODE_ENV !== "production" && developmentPassword) {
    return timingSafeStringEqual(password, developmentPassword);
  }

  return false;
}

export function verifyPasswordHash(password: string, expectedHash: string) {
  if (expectedHash.startsWith("sha256:")) {
    const expected = expectedHash.slice("sha256:".length);
    const actual = createHash("sha256").update(password).digest("hex");
    return timingSafeStringEqual(actual, expected);
  }

  return false;
}

function timingSafeStringEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(actualBuffer, expectedBuffer);
}
