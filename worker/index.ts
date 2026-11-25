// The chart is a static page at /crossover/, so the Worker only serves files for now.
// It redirects the old /day18 addresses, and API routes under /crossover/api/ (the game, later) go here.
export default {
  async fetch(request) {
    const url = new URL(request.url)
    if (url.pathname === '/day18' || url.pathname.startsWith('/day18/')) {
      url.pathname = '/crossover' + url.pathname.slice('/day18'.length)
      return Response.redirect(url.toString(), 301)
    }
    return new Response('Not found', { status: 404 })
  },
} satisfies ExportedHandler
