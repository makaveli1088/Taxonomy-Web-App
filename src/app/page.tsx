'use client';

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCw, MonitorSmartphone } from "lucide-react";

// ============================================================
// TAXONOMY LIST
// ============================================================
const TAXONOMY: Record<string, string[]> = {
  "Failed to ACCELERATE": [
    "Empty Zebra crossing","Yellow Box","Green Light","Turning","From Give Way","Traffic",
    "Narrow Road","Keep Clear Markings","From Stop Junction","Roundabout",
    "Pedestrian or Walker finished crossing","Clear road","Right on Red"
  ],
  "Failed to SLOW": [
    "Lead Vehicle","Red Light","Amber Light","Speed Limit","Speed Bump","Width",
    "Narrow Road","Approaching Junction","Merging","Pedestrian at crossing","Roadworks",
    "Cyclist","Vehicle","Bus","Refuse Truck","Keep Clear","Stop Junction","Potholes",
    "Giveway","Oncoming Vehicles","Non Priority Vehicles","Primary Stop Line","Other Dynamic Undertaking"
  ],
  "Failed to remain STOPPED": [
    "Stationary traffic","Junction","Maintain speed limit",
    "Pedestrian at Junction or informal crossing point","Jaywalking","Stop",
    "Non priority vehicles","Cyclist primary stop line","Rollback"
  ],
  "Failed to maintain SPEED": ["Harsh Brake","Green Light","Turning","Slowed too early","Exceed speed limit"],
  "Failed to follow ROUTE map": ["Unplotted turn","Incorrect Indicator","Missed Left Turn","Missed Right Turn","Incorrect lane for continue ahead","Incorrect lane for continue turn"],
  "Failed to OVERTAKE": ["Failed to complete Dynamic","Failed to complete Static","Failed to initiate Dynamic","Failed to initiate Static","Incorrectly initiated Dynamic","Incorrectly initiated Static"],
  "LATE Turn": ["Towards dynamic","Towards static","Towards oncoming lane","Towards ongoing restricted bus lane","Towards ongoing restricted cycle lane"],
  "EARLY Turn": ["Towards dynamic","Towards static","Towards oncoming lane","Towards ongoing restricted bus lane","Towards ongoing restricted cycle lane"],
  "Failed to follow LANE POSITION": [
    "Towards Left","Towards Right","Towards Restricted Lane","Hard Shoulder","Towards kerb",
    "Towards Dynamic","Towards Static","Towards Oncoming vehicle","Towards parked vehicle",
    "Erratic steering","Weaving in lane","Vulnerable Road User","Lane position for upcoming turn"
  ],
  "Lane Change": ["Unsafe Lane Change","Double Lane Change","Failed to initiate lane change","Unnecessary Indicator","Failed to Merge"]
};

// ============================================================
// OPTIONAL LINKS (map What+Why to video URLs)
// ============================================================
const LINKS: Record<string, Record<string, string>> = {
  // Example:
  // "Failed to SLOW": {
  //   "Speed Limit": "https://example.com/video1",
  //   "Red Light": "https://example.com/video2"
  // }
};
const getLink = (what: string, why: string) => LINKS[what]?.[why] || "";

// ============================================================
// COMPONENT
// ============================================================
export default function App() {
  const [active, setActive] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const whats = useMemo(() => Object.keys(TAXONOMY), []);
  const filteredWhats = useMemo(() => {
    if (!filter.trim()) return whats;
    const f = filter.toLowerCase();
    return whats.filter(
      (w) => w.toLowerCase().includes(f) || TAXONOMY[w].some((y) => y.toLowerCase().includes(f))
    );
  }, [filter, whats]);

  // Geometry
  const view = { w: 1200, h: active ? 700 : 1200 };
  const center = { x: view.w / 2, y: view.h / 2 };

  const WHAT_W = 320, WHAT_H = 52, R = 14;
  const WHY_W = 300, WHY_H = 44;
  const GAP_X = 140;
  const ROW_H = 56;
  const CURVE = 110;

  const topOffset = -view.h / 2 + 110;
  const getYOverview = (idx: number) => topOffset + idx * ROW_H;

  const allWhats = active ? [active] : filteredWhats;

  const splitWhys = (arr: string[]) => {
    const half = Math.ceil(arr.length / 2);
    return { left: arr.slice(0, half), right: arr.slice(half) };
  };

  const curvePath = (x1:number,y1:number,x2:number,y2:number,dir:"left"|"right") => {
    const c1x = dir==="left"? x1-CURVE : x1+CURVE;
    const c2x = dir==="left"? x2+CURVE : x2-CURVE;
    return `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`;
  };

  const WhyBox: React.FC<{x:number,y:number,label:string;what:string;side:"left"|"right";delay:number}> = ({x,y,label,what,side,delay}) => {
    const href = getLink(what,label);
    const clickable = !!href;
    const xStart = side==="left"? -WHAT_W/2 : WHAT_W/2;
    const xEnd   = side==="left"? x+WHY_W : x;

    return (
      <motion.g
        initial={{opacity:0,x:side==="left"?-20:20}}
        animate={{opacity:1,x:0}}
        exit={{opacity:0,x:side==="left"?-20:20}}
        transition={{duration:0.25,delay}}
        onClick={() => { if(clickable) window.open(href,"_blank","noopener"); }}
        style={{cursor:clickable?"pointer":"default"}}
      >
        <path d={curvePath(xStart,0,xEnd,y,side)} className="stroke-neutral-700" strokeWidth={1.5} fill="none"/>
        <rect x={x} y={y-WHY_H/2} rx={R} ry={R} width={WHY_W} height={WHY_H}
          className={clickable? "fill-neutral-900 stroke-teal-600" : "fill-neutral-900 stroke-neutral-700"}
          strokeWidth={1}/>
        <text x={x+WHY_W/2} y={y+5} textAnchor="middle" className={clickable? "fill-neutral-100 text-[12px]" : "fill-neutral-200 text-[12px]"}>
          {label}{clickable?" ↗":""}
        </text>
      </motion.g>
    );
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-10 backdrop-blur bg-neutral-900/90 border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center gap-2">
          <MonitorSmartphone className="w-5 h-5 opacity-80"/>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight">Wayve Taxonomy Mind-Map</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 opacity-70"/>
              <input value={filter} onChange={(e)=>setFilter(e.target.value)} placeholder="Search what/why…"
                className="pl-8 pr-2 py-1.5 rounded-xl bg-neutral-800/80 border border-neutral-700 text-sm" disabled={!!active}/>
            </div>
            <button onClick={()=>{setActive(null);setFilter("");}}
              className="px-2 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5"/> Reset
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex-1 overflow-auto">
        <svg className="w-full h-full" viewBox={`0 0 ${view.w} ${view.h}`}>
          <g transform={`translate(${center.x}, ${center.y})`}>
            {/* OVERVIEW MODE */}
            <AnimatePresence>
              {!active && allWhats.map((w,i)=>{
                const y = getYOverview(i);
                return (
                  <motion.g key={w}
                    initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.25}}
                    onClick={()=>setActive(w)} style={{cursor:"pointer"}}
                  >
                    <rect x={-360} y={y-WHAT_H/2} rx={R} ry={R} width={WHAT_W} height={WHAT_H}
                      className="fill-neutral-800 stroke-neutral-700" strokeWidth={1}/>
                    <text x={-360+WHAT_W/2} y={y+6} textAnchor="middle"
                      className="fill-neutral-100 text-[12px] font-medium">{w}</text>
                  </motion.g>
                );
              })}
            </AnimatePresence>

            {/* FOCUS MODE */}
            <AnimatePresence>
              {active && (
                <>
                  {/* Center WHAT */}
                  <motion.g initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.25}}>
                    <rect x={-WHAT_W/2} y={-WHAT_H/2} rx={R} ry={R} width={WHAT_W} height={WHAT_H}
                      className="fill-teal-600 stroke-teal-300" strokeWidth={1}
                      onClick={()=>setActive(null)} style={{cursor:"pointer"}}/>
                    <text x={0} y={6} textAnchor="middle" className="fill-black text-[13px] font-semibold">{active}</text>
                  </motion.g>

                  {/* WHY boxes left/right */}
                  {(() => {
                    const {left,right} = splitWhys(TAXONOMY[active]);
                    const leftYOffset = -((left.length-1)*ROW_H)/2;
                    const rightYOffset = -((right.length-1)*ROW_H)/2;
                    const leftX = -(WHAT_W/2+GAP_X+WHY_W);
                    const rightX = WHAT_W/2+GAP_X;
                    return (
                      <>
                        {left.map((why,j)=>(
                          <WhyBox key={`L-${why}`} x={leftX} y={leftYOffset+j*ROW_H}
                            label={why} what={active} side="left" delay={Math.min(0.5,j*0.03)}/>
                        ))}
                        {right.map((why,j)=>(
                          <WhyBox key={`R-${why}`} x={rightX} y={rightYOffset+j*ROW_H}
                            label={why} what={active} side="right" delay={Math.min(0.5,j*0.03)}/>
                        ))}
                      </>
                    );
                  })()}
                </>
              )}
            </AnimatePresence>
          </g>
        </svg>
      </div>

      <footer className="text-[11px] text-neutral-400 px-3 py-2 max-w-5xl mx-auto w-full">
        • Click a What to focus • Whys split left/right with curved connectors • Add video links in LINKS map
      </footer>
    </div>
  );
}
