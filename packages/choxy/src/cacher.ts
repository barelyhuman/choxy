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
      set(t) {
        listeners.forEach(l => l(t))
        // @ts-ignore
        return Reflect.set(...arguments)
      },
    }
  )
  const listeners = new Set() as Set<Listener>

  const sub = createSubUnSub(listeners)

  return { sub, listenable: proxy }
}

export function createCache(fetcher) {
  const toFetch = Symbol('loading')
  const { listenable, sub: subList } = createListenable()
  const cache = {}
  const proxyCache = new Proxy(cache, {
    get(t, p, r) {
      // @ts-ignore
      if (p === '__proto__') return Reflect.get(...arguments)

      if (!t[p]) listenable[p] = toFetch

      // @ts-ignore
      return Reflect.get(...arguments)
    },
  })

  const cacheListeners = new Set() as Set<Listener>

  subList(async changedList => {
    const promises = Object.keys(changedList)
      .filter(x => changedList[x] === toFetch)
      .map(async x => {
        const data = await fetcher(x)
        proxyCache[x] = data
      })
    await Promise.all(promises)
    cacheListeners.forEach(l => l(proxyCache))
  })

  const sub = createSubUnSub(cacheListeners)

  return { cache: proxyCache, sub }
}
