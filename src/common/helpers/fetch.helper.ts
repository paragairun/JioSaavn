import { userAgents, type Endpoints } from '#common/constants'
import type { ApiContextEnum } from '#common/enums'

type EndpointValue = (typeof Endpoints)[keyof typeof Endpoints]

interface FetchParams {
  endpoint: EndpointValue
  params: Record<string, string | number>
  context?: ApiContextEnum
}

interface FetchResponse<T> {
  data: T
  ok: Response['ok']
}

export const useFetch = async <T>({ endpoint, params, context }: FetchParams): Promise<FetchResponse<T>> => {
  const url = new URL('https://www.jiosaavn.com/api.php')

  url.searchParams.append('__call', endpoint.toString())
  url.searchParams.append('_format', 'json')
  url.searchParams.append('_marker', '0')
  url.searchParams.append('api_version', '4')
  // TEST CHANGE: was hardcoded to 'web6dot0'. Confirmed real searches
  // (e.g. "aashayein") return a smaller, genuinely different result set
  // from this wrapper than JioSaavn's own live website search does for
  // the identical query -- the real song was completely absent across
  // every page. 'web6dot0' vs 'android' are the only two context values
  // this codebase's ApiContextEnum knows about. Testing whether JioSaavn's
  // backend serves a more complete/different index under the android
  // context. If this doesn't help, revert back to 'web6dot0'.
  url.searchParams.append('ctx', context || 'android')

  Object.keys(params).forEach((key) => url.searchParams.append(key, String(params[key])))

  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)]

  const response = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json', 'User-Agent': randomUserAgent }
  })

  const data = await response.json()

  return { data: data as T, ok: response.ok }
}
