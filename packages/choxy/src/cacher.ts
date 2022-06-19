export type Listener = (params: any) => void
export type Indexable = string | number | symbol
export type Fetcher = (...params: any[]) => Promise<any>

function createSubUnSub(listeners: Set<Listener>) {
  return l => {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }
}

function createListenable() {
  const proxy = new Proxy(
    {},
    {
      set(t, p, v) {
        t[p] = v
        listeners.forEach(l => l(t))
        return true
      },
    }
  )
  const listeners = new Set() as Set<Listener>

  const sub = createSubUnSub(listeners)

  return { sub, listenable: proxy }
}

export type CreateCacheOptions = {
  expiry?: number
}

const defaultOptions: CreateCacheOptions = {
  expiry: 60 * 1000,
}

export function createCache(fetcher, options?: CreateCacheOptions) {
  const { expiry } = Object.assign({}, defaultOptions, options)
  const LOADING = Symbol('loading')
  let queue = []
  const { listenable, sub: subList } = createListenable()
  const expiries = {}
  const proxyCache = new Proxy(
    {},
    {
      get(t, p, r) {
        // @ts-ignore
        if (p === '__proto__') return Reflect.get(...arguments)

        if (!t[p] && !listenable[p]) {
          listenable[p] = LOADING
        }

        // @ts-ignore
        return Reflect.get(...arguments)
      },
    }
  )

  const cacheListeners = new Set() as Set<Listener>

  subList(async changedList => {
    const promises = Object.keys(changedList)
      .filter(x => {
        const isLoading = changedList[x] === LOADING
        const isNotInQ = queue.indexOf(x) === -1
        const hasExpired =
          expiries[x] && new Date(expiries[x]).getTime() <= new Date().getTime()

        return isLoading && (isNotInQ || hasExpired)
      })
      .map(async fetchableParam => {
        queue.push(fetchableParam)
        const data = await fetcher(fetchableParam)
        const expiredAt = new Date()
        expiredAt.setMilliseconds(expiredAt.getMilliseconds() + expiry)

        expiries[fetchableParam] = expiredAt
        proxyCache[fetchableParam] = data

        queue = queue.filter(y => y !== fetchableParam)
      })

    await Promise.all(promises)
    cacheListeners.forEach(l => l(proxyCache))
  })

  const sub = createSubUnSub(cacheListeners)

  return { cache: proxyCache, sub }
}
