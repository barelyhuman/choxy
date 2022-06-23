import mdx from '@next/mdx'
import autoLink from 'rehype-autolink-headings'
import slug from 'rehype-slug'

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [autoLink, slug],
  },
})

export default withMDX({
  reactStrictMode: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
})
