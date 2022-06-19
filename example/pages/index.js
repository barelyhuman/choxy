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
  const [readFromCache, setReadFromCache] = useState(false)

  return (
    <div>
      <h1>Initial Fetch</h1>
      <p>
        <span>Post: {cache['posts.1']?.title}</span>
        <br />
        <strong>timeToFetch:{cache['posts.1']?.timeToFetch}</strong>
      </p>
      <p>
        Todo: {cache['todos.1']?.title}
        <br />
        <strong>timeToFetch:{cache['todos.1']?.timeToFetch}</strong>
      </p>
      <p>
        Comment: {cache['comments.1']?.body}
        <br />
        <strong>timeToFetch:{cache['comments.1']?.timeToFetch}</strong>
      </p>
      <p>
        User: {cache['users.1']?.username}
        <br />
        <strong>timeToFetch:{cache['users.1']?.timeToFetch}</strong>
      </p>
      <button onClick={() => setReadFromCache(true)}>Load from cache</button>
      {readFromCache && <FromCache />}
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

function FromCache() {
  const { cache } = useCache()
  return (
    <>
      <h1>From Cache</h1>
      <p>Post: {cache['posts.1']?.title}</p>
      <p>Todo: {cache['todos.1']?.title}</p>
      <p>Comment: {cache['comments.1']?.body}</p>
      <p>User: {cache['users.1']?.username}</p>
    </>
  )
}
