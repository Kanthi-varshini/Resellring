// Ambient 3D scene — floating gradient orbs unique to this product's identity.
export default function SceneBackground() {
  const orbs = [
    { color: 'bg-lime-400/8', size: 'h-[26rem] w-[26rem]', pos: '-top-32 -left-24' },
    { color: 'bg-yellow-400/8', size: 'h-[22rem] w-[22rem]', pos: 'top-1/3 -right-32' },
    { color: 'bg-green-400/6', size: 'h-[18rem] w-[18rem]', pos: '-bottom-20 right-1/4' },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {orbs.map((o, i) => (
        <div key={i} className={`absolute ${o.pos} ${o.size} ${o.color} rounded-full blur-[110px]`}
          style={{ animation: `orbFloat ${12 + i * 3}s ease-in-out ${i * -4}s infinite alternate` }} />
      ))}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #84cc16 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
    </div>
  );
}
