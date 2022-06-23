type ExpiryPluginOptions = {
  milliseconds: number
}

export function expiryPlugin(options: ExpiryPluginOptions) {
  let expiries = new Map()

  return {
    beforePick(cache, key, q) {
      const expiry = expiries.get(key)
      const isExpired = new Date(expiry).getTime() < new Date().getTime()
      if (isExpired) {
        delete cache[key]
        delete q[key]
      }
    },
    after(cache, keys) {
      keys.forEach(key => {
        const expireIn = options.milliseconds
        const expiry = new Date()
        expiry.setMilliseconds(expiry.getMilliseconds() + expireIn)
        expiries.set(key, expiry)
      })
    },
  }
}
