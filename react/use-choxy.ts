import { useEffect } from 'react'
import { useState } from 'react'

import { createChoxy, CreateChoxyOptions, Fetcher } from '@barelyhuman/choxy'

export function createUseChoxy(fetcher: Fetcher, options: CreateChoxyOptions) {
  const { sub, data } = createChoxy(fetcher, options)

  // rethink this since the hydrated element will differ from the
  // client rendered one, so
  // leaving it as useEffect for now
  // const useIsomorphicEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
  const useIsomorphicEffect = useEffect

  return function useCache() {
    const rerender = useState({})[1]
    useIsomorphicEffect(() => {
      const unsub = sub(() => {
        rerender({})
      })

      return unsub
    }, [])

    return { data }
  }
}
