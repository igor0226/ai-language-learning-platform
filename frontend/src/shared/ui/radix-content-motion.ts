/**
 * Enter/exit motion for Radix portaled surfaces.
 * Use fade + zoom only — slide/translate utilities fight Radix popper
 * transforms and centered dialog positioning during animation.
 */
export const radixSurfaceEnterExit =
	"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95";

export const radixOverlayEnterExit =
	"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";
