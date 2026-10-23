import { AnimatedLogo } from "@/components/animated-logo";
import { ProfileMenu } from "@/components/profile-menu";
import { GuestHeaderActions } from "@/components/guest-header-actions";

export function AppHeader({
  isAdmin,
  name,
  image,
  isGuest,
}: {
  isAdmin?: boolean;
  name?: string | null;
  image?: string | null;
  isGuest: boolean;
}) {
  return (
    <header className="glass-surface sticky top-0 z-30 relative flex items-center justify-end border-x-0 border-t-0 px-6 py-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <AnimatedLogo />
      </div>
      <div className="flex items-center gap-4">
        {isGuest ? <GuestHeaderActions /> : <ProfileMenu name={name} image={image} isAdmin={isAdmin} />}
      </div>
    </header>
  );
}
