export default function StatusBadge({status}){
  const map = {active:'#10b981',pending:'#f59e0b',suspended:'#ef4444'}
  const color = map[status] || '#94a3b8'
  return (
    <span style={{background:color, color:'#fff', padding:'6px 10px', borderRadius:999, fontSize:12}}>
      {String(status).toUpperCase()}
    </span>
  )
}
