// Used on the "add to whitelist" action -- a shield-check reads as "trusted /
// cleared" without needing a text label.
export function ApproveIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25">
      <path
        d="M12 2.5 4.5 5.3V11c0 5.1 3.2 9 7.5 11 4.3-2 7.5-5.9 7.5-11V5.3L12 2.5Z"
        stroke-linejoin="round"
      />
      <path d="m8.3 12.1 2.5 2.5 5-5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}
