import { useEffect, useLayoutEffect } from 'react'
import { useState } from 'react'

import { createCache } from '../cacher'
import type { Fetcher } from '../cacher'

export function createUseCache(fetcher: Fetcher) {
  const { sub, cache } = createCache(fetcher)

  // rethink this since the hydrated element will differ from the
  // client rendered one, so
  // leaving it as useEffect for now
  // const useIsomorphicEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
  const useIsomorphicEffect = useEffect

  return function useCache() {
    const rerender = useState({})[1]

    useIsomorphicEffect(() => {
      sub(() => {
        rerender({})
      })
    }, [])

    return { cache }
  }
}
