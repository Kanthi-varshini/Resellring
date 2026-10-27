// Minimal dark ambient for ResellRing void aesthetic
export default function SceneBackground() {
  const orbs = [
    { color: 'bg-acid/6', size: 'h-[30rem] w-[38rem]', pos: '-top-28 left-1/2 -translate-x-1/2', dur: '18s', delay: '0s' },
    { color: 'bg-ember/4', size: 'h-[22rem] w-[22rem]', pos: 'bottom-0 right-0', dur: '22s', delay: '-5s' },
    { color: 'bg-acid/3', size: 'h-[14rem] w-[14rem]', pos: 'top-1/2 left-1/4', dur: '16s', delay: '-8s' },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {orbs.map((o, i) => (
        <div key={i}
          className={`blob absolute ${o.pos} ${o.size} ${o.color} rounded-full`}
          style={{ animation: `orbFloat ${o.dur} ease-in-out ${o.delay} infinite` }}
        />
      ))}
    </div>
  );
}
