"use client";

function ActionIconButton({
  active,
  icon,
  activeIcon,
  count,
  label,
  onClick,
}: {
  active: boolean;
  icon: string;
  activeIcon: string;
  count?: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        border: "1px solid rgba(0,0,0,0.08)",
        background: active ? "rgba(248, 77, 67, 0.10)" : "#fff",
        color: "inherit",
        padding: "10px 12px",
        borderRadius: 9999,
        lineHeight: 1,
      }}
    >
      <i className={active ? activeIcon : icon} style={{ opacity: 0.75 }} />
      {typeof count === "number" ? (
        <span style={{ fontSize: 14, opacity: 0.85 }}>({count})</span>
      ) : null}
    </button>
  );
}

export default function CampaignActions({
  liked,
  followed,
  flagged,
  likeCount,
  followerCount,
  onToggleLike,
  onToggleFollow,
  onToggleFlag,
}: {
  liked: boolean;
  followed: boolean;
  flagged: boolean;
  likeCount: number;
  followerCount: number;
  onToggleLike: () => void;
  onToggleFollow: () => void;
  onToggleFlag: () => void;
}) {
  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <ActionIconButton
          active={liked}
          icon="far fa-heart"
          activeIcon="fas fa-heart"
          count={likeCount}
          label="Like"
          onClick={onToggleLike}
        />

        <ActionIconButton
          active={followed}
          icon="far fa-user-plus"
          activeIcon="fas fa-user-check"
          count={followerCount}
          label="Follow"
          onClick={onToggleFollow}
        />

        <ActionIconButton
          active={flagged}
          icon="far fa-flag"
          activeIcon="fas fa-flag"
          label="Flag"
          onClick={onToggleFlag}
        />
      </div>
    </div>
  );
}
