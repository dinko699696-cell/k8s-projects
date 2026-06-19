export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="nav-section">Main</div>
      <div className="nav-item active">
        <span className="nav-icon">⊞</span> Dashboard
      </div>
      <div className="nav-item">
        <span className="nav-icon">✉</span> Messages
      </div>

      <div className="nav-section">Infrastructure</div>
      <div className="nav-item">
        <span className="nav-icon">🗄</span> MongoDB
        <span className="nav-dot green"></span>
      </div>
      <div className="nav-item">
        <span className="nav-icon">⚡</span> Redis
        <span className="nav-dot green"></span>
      </div>
      <div className="nav-item">
        <span className="nav-icon">⬡</span> Backend
        <span className="nav-dot green"></span>
      </div>

      <div className="nav-section">Info</div>
      <div className="nav-item">
        <span className="nav-icon">↯</span> Activity
      </div>
      <div className="nav-item">
        <span className="nav-icon">ℹ</span> About
      </div>
    </aside>
  )
}