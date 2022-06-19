import { createUseCache } from '@barelyhuman/choxy/hooks'
import { useState } from 'react'

const _fetcher = key => {
  const urlPath = key.split('.').join('/')
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

const useCache = createUseCache(_fetcher)

export default function Home() {
  const { cache } = useCache()
  const [id, setId] = useState(1)

  return (
    <div>
      <label>Change the id to see the cache in action</label>

      <input type="text" value={id} onChange={e => setId(e.target.value)} />

      <p>
        Fetching: https://jsonplaceholder.typicode.com/{'{entity}'}/{id}
      </p>

      <p>
        <span>Post: {cache[`posts.${id}`]?.title}</span>
        <br />
        <strong>first fetch:{cache[`posts.${id}`]?.timeToFetch}</strong>
      </p>
      <p>
        Todo: {cache[`todos.${id}`]?.title}
        <br />
        <strong>first fetch:{cache[`todos.${id}`]?.timeToFetch}</strong>
      </p>
      <p>
        Comment: {cache[`comments.${id}`]?.body}
        <br />
        <strong>first fetch:{cache[`comments.${id}`]?.timeToFetch}</strong>
      </p>
      <p>
        User: {cache[`users.${id}`]?.username}
        <br />
        <strong>first fetch:{cache[`users.${id}`]?.timeToFetch}</strong>
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
