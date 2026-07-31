import type { IncomingMessage, ServerResponse } from 'node:http'
import { withJsonHandler } from './_lib/httpJson.js'
import { handleAnalyze } from './_lib/analyzeHandler.js'

export const config = { api: { bodyParser: false } }
export const maxDuration = 30

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await withJsonHandler(req, res, (body) => handleAnalyze(body))
}
