export default function Navigation() {
  return (
    <>
      <header>
        <h3>choxy</h3>
        <nav>
          <a href="#getting-started">Getting Started</a>
          <a href="#plugins">Plugins</a>
          <a href="#who-is-it-for">For?</a>
          <a href="#demo">Demo</a>
          <a
            target="_blank"
            href="https://github.com/barelyhuman/choxy"
            rel="noreferrer"
          >
            Github
          </a>
        </nav>
      </header>
      <style jsx>{`
        header {
          display: flex;
          align-items: center;
        }

        nav {
          margin-left: auto;
        }

        nav a {
          display: inline-block;
          text-decoration: none;
          padding: 4px 8px;
          border-radius: 4px;
          color: var(--subtle) !important;
        }

        nav a:hover {
          background-color: var(--overlay);
          color: var(--subtle);
        }
      `}</style>
    </>
  )
}
