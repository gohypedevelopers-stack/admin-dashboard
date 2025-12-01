export default function StatsCard({title, value, delta}){
  return (
    <div className="card" style={{display:'inline-block',minWidth:220,marginRight:12}}>
      <div style={{fontSize:12,color:'#6b7280'}}>{title}</div>
      <div style={{fontSize:24,fontWeight:700,marginTop:6}}>{value}</div>
      {delta && <div style={{fontSize:12,color:'#10b981',marginTop:8}}>{delta}</div>}
    </div>
  )
}
