import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/login',
  '/sign-in/sso-callback',
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth.protect({
      unauthenticatedUrl: "/login", 
      unauthorizedUrl: "/dashboard",
    })
  }

})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
