export {};

declare global {
  interface Window {
    Clerk?: {
      signOut: () => Promise<void>;
    };
  }
}
