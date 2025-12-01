export default function Header({onToggleSidebar}){
  return (
    <div className="header container">
      <div className="header-left">
        <button onClick={onToggleSidebar} style={{marginRight:12}}>☰</button>
        <h2 className="header-title">Admin Console</h2>
        <div className="muted">Overview and management tools</div>
      </div>
      <div className="header-right">
        <input className="search" placeholder="Search users, doctors, pharmacies..." />
        <div className="avatar">AD</div>
      </div>
    </div>
  )
}
