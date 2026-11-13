import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Fixed-window counter keyed by an arbitrary string (see RateLimitHit in
// schema.prisma). Returns true if this hit is allowed (and records it),
// false once `limit` hits have already landed in the current window.
//
// The first hit in a window always succeeds via `create`; every later one
// collides on the @@unique([key, windowKey]) constraint, so it falls back
// to an `updateMany` guarded by `count: { lt: limit }` — guaranteed atomic
// at the DB level, so two concurrent requests can't both slip through at
// the boundary the way a read-then-write check would allow.
export async function rateLimitHit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const windowKey = Math.floor(Date.now() / windowMs).toString();

  try {
    await prisma.rateLimitHit.create({ data: { key, windowKey, count: 1 } });
    return true;
  } catch (err) {
    if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") {
      throw err;
    }
  }

  const result = await prisma.rateLimitHit.updateMany({
    where: { key, windowKey, count: { lt: limit } },
    data: { count: { increment: 1 } },
  });
  return result.count > 0;
}

// Best-effort client IP from standard proxy headers (Vercel and most
// reverse proxies set x-forwarded-for; "unknown" just means every signup
// from an unidentifiable client shares one bucket, which is a reasonable
// fail-safe default rather than a crash).
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
