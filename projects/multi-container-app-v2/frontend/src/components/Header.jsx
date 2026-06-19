export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">⎈</span>
          <span className="logo-text">K8s App</span>
        </div>
        <nav className="nav">
          <span className="nav-item">v2.0</span>
          <span className="badge">Live</span>
        </nav>
      </div>
    </header>
  )
}