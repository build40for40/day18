// The chart is a static page, so the Worker only serves files for now.
// API routes under /day18/api/ (the game, later) go here.
export default {
  async fetch() {
    return new Response('Not found', { status: 404 })
  },
} satisfies ExportedHandler
