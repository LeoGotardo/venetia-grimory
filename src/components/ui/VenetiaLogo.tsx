export function VenetiaLogo({ size = 18 }: { size?: number }) {
  return (
    <div style={{ filter: 'drop-shadow(0 0 5px rgba(212,160,23,0.42))' }}>
      <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
        <polygon points="30,4 55,22 5,22"   fill="#7A5D0E" stroke="#2C1A04" strokeWidth="1.1" strokeLinejoin="round"/>
        <polygon points="5,22 30,22 15,51"  fill="#B08018" stroke="#2C1A04" strokeWidth="1.1" strokeLinejoin="round"/>
        <polygon points="55,22 45,51 30,22" fill="#5E4508" stroke="#2C1A04" strokeWidth="1.1" strokeLinejoin="round"/>
        <polygon points="30,22 45,51 15,51" fill="#D4A017" stroke="#2C1A04" strokeWidth="1.1" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}
