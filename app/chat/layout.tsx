/**
 * Chat layout — suppresses the Footer for full-screen chat experience.
 * The root layout still provides Navbar, CartDrawer, ChatWidget, and Toaster.
 * We use a CSS override to hide the footer when inside /chat.
 */
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        /* Hide footer and remove main min-height in chat view */
        footer { display: none !important; }
      `}</style>
      {children}
    </>
  );
}
