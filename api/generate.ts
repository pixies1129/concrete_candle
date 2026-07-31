import type { IncomingMessage, ServerResponse } from 'node:http'
import { withJsonHandler } from './_lib/httpJson.js'
import { handleGenerate } from './_lib/generateHandler.js'

export const config = { api: { bodyParser: false } }
export const maxDuration = 60

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await withJsonHandler(req, res, (body) => handleGenerate(body))
}
