type RefetchPluginOptions = {
  milliseconds: number
}

// FIXME: Naive implementation of an auto fetch
// TODO: needs to add support for refetch on window focus
// and ability to add a validation function for more
// extensibility
export function UNSTABLE_refetchPlugin(options: RefetchPluginOptions) {
  let lastFetch = new Map()

  const emptyCaller = m => m

  return {
    beforePick(cache, key, q) {
      const fetchTime = lastFetch.get(key)
      const isExpired = new Date(fetchTime).getTime() < new Date().getTime()
      if (isExpired) {
        delete cache[key]
        delete q[key]
        emptyCaller(cache[key])
      }
    },
    after(cache, keys) {
      keys.forEach(key => {
        const fetchIn = options.milliseconds
        const _lastFetch = new Date()
        _lastFetch.setMilliseconds(_lastFetch.getMilliseconds() + fetchIn)
        lastFetch.set(key, _lastFetch)
      })
    },
  }
}
