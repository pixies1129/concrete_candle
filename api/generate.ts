import type { IncomingMessage, ServerResponse } from 'node:http'
import { withJsonHandler } from './_lib/httpJson'
import { handleGenerate } from './_lib/generateHandler'

export const config = { api: { bodyParser: false } }

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }
  await withJsonHandler(req, res, (body) => handleGenerate(body))
}
