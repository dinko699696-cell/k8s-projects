export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <span className="header-icon">⎈</span>
        <span className="header-title">K8s App</span>
        <span className="header-version">v3.0</span>
      </div>
      <div className="header-right">
        <span className="header-ns">app-v2 namespace</span>
        <span className="badge-live">● Live</span>
      </div>
    </header>
  )
}