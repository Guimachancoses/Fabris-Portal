export async function signOutClerk(): Promise<void> {
    if (typeof window !== "undefined" && window.Clerk) {
      await window.Clerk.signOut();
    } else {
      console.warn("Clerk não está disponível no window.");
    }
  }
  