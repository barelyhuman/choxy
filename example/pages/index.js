import { createUseChoxy } from '@barelyhuman/choxy/react'
import Introduction from 'components/intro.mdx'
import { useState } from 'react'

import Navigation from '../components/navigation'

const _fetcher = key => {
  const parts = key.split('.').filter(x => x)
  const urlPath = parts.join('/')
  return new Promise(resolve => {
    const start = Date.now()
    setTimeout(() => {
      fetch(`https://jsonplaceholder.typicode.com/${urlPath}`)
        .then(response => response.json())
        .then(json => {
          resolve({ ...json, timeToFetch: Date.now() - start + 'ms' })
        })
    }, 2500)
  })
}

let expiries = new Map()

const expiryPlug = {
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
      const expireIn = 15 * 1000 // 15 seconds
      const expiry = new Date()
      expiry.setMilliseconds(expiry.getMilliseconds() + expireIn)
      expiries.set(key, expiry)
    })
  },
}

const useChoxy = createUseChoxy(_fetcher, { plugins: [expiryPlug] })

export default function Home() {
  const { data } = useChoxy()
  const [id, setId] = useState(1)

  return (
    <div>
      <Navigation />
      <Introduction />
      <h2 id="demo">Demo</h2>
      <label>Change the id to see the cache in action</label>

      <input type="text" value={id} onChange={e => setId(e.target.value)} />

      <p>
        Fetching: https://jsonplaceholder.typicode.com/{'{entity}'}/{id}
      </p>
      <p>Currently: cache set to expire in 15 seconds</p>

      <pre>
        {`
        const useChoxy = createUseChoxy(_fetcher, { plugins: [expiryPlugin] })

        function App(){
          const { data } = useChoxy()
          const [id, setId] = useState(1)

          return <>
            <span>Post: {data[\`posts.${id}\`]?.title}</span>
            <span>Todo: {data[\`todo.${id}\`]?.title}</span>
            <span>Comment: {data[\`posts.${id}\`]?.body}</span>
            <span>User: {data[\`users.${id}\`]?.username}</span>   
          </>
        }
      `}
      </pre>

      <p>
        <span>Post: {data[`posts.${id}`]?.title}</span>
        <br />
        <strong>first fetch:{data[`posts.${id}`]?.timeToFetch}</strong>
      </p>
      <p>
        Todo: {data[`todos.${id}`]?.title}
        <br />
        <strong>first fetch:{data[`todos.${id}`]?.timeToFetch}</strong>
      </p>
      <p>
        Comment: {data[`comments.${id}`]?.body}
        <br />
        <strong>first fetch:{data[`comments.${id}`]?.timeToFetch}</strong>
      </p>
      <p>
        User: {data[`users.${id}`]?.username}
        <br />
        <strong>first fetch:{data[`users.${id}`]?.timeToFetch}</strong>
      </p>
      <style jsx>
        {`
          div {
            max-width: 80ch;
            margin: 0 auto;
            padding: 10px;
          }
        `}
      </style>
    </div>
  )
}
