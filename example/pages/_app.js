import '../styles/globals.css'
import 'highlight.js/styles/github-dark.css'

import hljs from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import { useEffect } from 'react'
hljs.registerLanguage('javascript', javascript)

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    hljs.initHighlighting()
  }, [])
  return <Component {...pageProps} />
}

export default MyApp
