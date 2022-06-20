export type Listener = (params: any) => void
export type Indexable = string | number | symbol
export type Fetcher = (...params: any[]) => Promise<any>
export type ChoxyPlugin = {
  beforePick: (cache: any, key: Indexable, q: any) => void
  before: (cache: any, keys: Indexable[]) => void
  after: (cache: any, keys: Indexable[]) => void
}

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

export type CreateChoxyOptions = {
  plugins?: ChoxyPlugin[]
}

const defaultOptions: CreateChoxyOptions = {
  plugins: [],
}

export function createChoxy(fetcher, options?: CreateChoxyOptions) {
  const { plugins } = Object.assign({}, defaultOptions, options)
  const LOADING = Symbol('loading')
  const { listenable: queueMap, sub: subQueueMap } = createListenable()
  let fetchQueue = []
  const proxyCache = new Proxy(
    {},
    {
      get(t, p, r) {
        // @ts-ignore
        if (!p || p === '__proto__') return Reflect.get(...arguments)

        // let the plugins modify the target / queue
        options.plugins.forEach(
          x => x.beforePick && x.beforePick(t, p, queueMap)
        )

        // check if it needs to be added into queue on the initial pick
        if (!t[p] && !queueMap[p]) queueMap[p] = LOADING

        // @ts-ignore
        return Reflect.get(...arguments)
      },
    }
  )

  const cacheListeners = new Set() as Set<Listener>

  async function queueHandler(nextQueueMap) {
    let allKeys = Object.keys(nextQueueMap)

    const fetcherPromises = []

    await Promise.all(
      plugins.map(x => x.before && x.before(proxyCache, allKeys))
    )

    allKeys.forEach(param => {
      const process = async () => {
        const isLoading = nextQueueMap[param] === LOADING
        const inFQueue = fetchQueue.indexOf(param) > -1

        if (inFQueue) return

        if (!isLoading) return

        fetchQueue.push(param)
        const data = await fetcher(param)
        proxyCache[param] = data
        delete queueMap[param]
        fetchQueue = fetchQueue.filter(x => x !== param)
      }

      fetcherPromises.push(process())
    })

    await Promise.all(fetcherPromises)
    await Promise.all(plugins.map(x => x.after && x.after(proxyCache, allKeys)))

    cacheListeners.forEach(l => l(proxyCache))
  }

  subQueueMap(queueHandler)

  const sub = createSubUnSub(cacheListeners)

  return { data: proxyCache, sub }
}
