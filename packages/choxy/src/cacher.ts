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

export function createCache(fetcher) {
  const LOADING = Symbol('loading')
  let queue = []
  const { listenable, sub: subList } = createListenable()
  const cache = {}
  const proxyCache = new Proxy(cache, {
    get(t, p, r) {
      // @ts-ignore
      if (p === '__proto__') return Reflect.get(...arguments)

      if (!t[p] && !listenable[p]) {
        listenable[p] = LOADING
      }

      // @ts-ignore
      return Reflect.get(...arguments)
    },
  })

  const cacheListeners = new Set() as Set<Listener>

  subList(async changedList => {
    const promises = Object.keys(changedList)
      .filter(x => changedList[x] === LOADING && queue.indexOf(x) === -1)
      .map(async fetchableParam => {
        queue.push(fetchableParam)
        const data = await fetcher(fetchableParam)
        proxyCache[fetchableParam] = data
        queue = queue.filter(y => y !== fetchableParam)
      })

    await Promise.all(promises)
    cacheListeners.forEach(l => l(proxyCache))
  })

  const sub = createSubUnSub(cacheListeners)

  return { cache: proxyCache, sub }
}
