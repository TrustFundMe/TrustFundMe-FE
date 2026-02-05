'use client';

export default function SubmitResultPanel({
    variant,
    title,
    message,
    primaryLabel,
    onPrimary,
    secondaryLabel,
    onSecondary,
}: {
    variant: 'success' | 'error';
    title: string;
    message: string;
    primaryLabel: string;
    onPrimary: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
}) {
    const styles =
        variant === 'success'
            ? {
                wrap: 'border-emerald-200 bg-emerald-50',
                title: 'text-emerald-900',
                msg: 'text-emerald-800',
                primary: 'bg-emerald-600 hover:bg-emerald-700',
            }
            : {
                wrap: 'border-rose-200 bg-rose-50',
                title: 'text-rose-900',
                msg: 'text-rose-800',
                primary: 'bg-rose-600 hover:bg-rose-700',
            };

    return (
        <div className={`rounded-2xl border p-4 ${styles.wrap}`}>
            <div className={`text-sm font-semibold ${styles.title}`}>{title}</div>
            <div className={`mt-1 text-sm ${styles.msg}`}>{message}</div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={onPrimary}
                    className={`inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white shadow-sm ${styles.primary}`}
                >
                    {primaryLabel}
                </button>
                {secondaryLabel && onSecondary ? (
                    <button
                        type="button"
                        onClick={onSecondary}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                        {secondaryLabel}
                    </button>
                ) : null}
            </div>
        </div>
    );
}
