import type { SVGProps } from "react";

export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-8.66 15L2 22l5.12-1.34A10 10 0 1 0 12 2Z"
      />
      <path
        fill="white"
        d="M8.1 7.2c.2-.4.5-.4.8-.4h.6c.2 0 .4.1.5.4l.9 2.1c.1.3.1.5-.1.7l-.8 1c.8 1.6 2 2.8 3.7 3.6l.9-1.1c.2-.2.5-.3.7-.1l2 .9c.3.1.4.3.4.5v.6c0 .3-.1.7-.4.9-.5.5-1.3.8-2 .8-4.5-.2-8.1-3.8-8.3-8.3 0-.7.2-1.5.7-2Z"
      />
    </svg>
  );
}
