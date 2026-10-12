"use client";

import Link from "next/link";

type SubmissionRow = {
  id: string;
  title: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote: string | null;
  createdAt: string;
  approvedSlug: string | null;
};

function StatusBadge({ status }: { status: SubmissionRow["status"] }) {
  const styles: Record<SubmissionRow["status"], string> = {
    PENDING: "border-[#B45309] bg-[#FEF3E2] text-[#B45309]",
    APPROVED: "border-[#1B4332] bg-[#EDF3EF] text-[#1B4332]",
    REJECTED: "border-red-300 bg-red-50 text-red-700",
  };
  const labels: Record<SubmissionRow["status"], string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
  };
  return (
    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function MySubmissions({ submissions }: { submissions: SubmissionRow[] }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-ink">Your submissions</h2>
      <div className="mt-2 rounded-2xl border border-border bg-surface px-4">
        {submissions.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-2 border-b border-border py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{s.title}</p>
              {s.status === "APPROVED" && s.approvedSlug && (
                <Link
                  href={`/recipe/${s.approvedSlug}`}
                  className="text-xs text-link underline"
                >
                  View live recipe
                </Link>
              )}
              {s.status === "REJECTED" && s.reviewNote && (
                <p className="text-xs text-muted">Note: {s.reviewNote}</p>
              )}
            </div>
            <StatusBadge status={s.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
