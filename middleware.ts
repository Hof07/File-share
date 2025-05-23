import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',                // home
  '/sign-in(.*)',     // sign-in pages
  '/sign-up(.*)',     // sign-up pages
  '/f(.*)'            // allow public access to /f and any subroutes like /f/abc
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|.*\\.(?:css|js|png|jpg|svg|ico|json)).*)',
    '/api/(.*)'
  ],
}
