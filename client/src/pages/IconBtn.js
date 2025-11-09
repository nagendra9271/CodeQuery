export function IconBtn({ Icon, isActive, color, children, ...props }) {
  return (
    <button
      className={`btn icon-btn ${isActive ? "icon-btn-active" : ""} ${
        color || ""
      }`}
      {...props}
    >
      <span className={`${children != null ? "mr-1" : ""}`}>
        <Icon aria-hidden="true" />
      </span>
      {children}
    </button>
  );
}

export function Icon({ Icon, isActive, color, children, ...props }) {
  return (
    <span>
      <span className={`${children != null ? "mr-1" : ""}`}>
        <Icon />
      </span>
      {children}
    </span>
  );
}
