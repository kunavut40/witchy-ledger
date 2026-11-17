import { useEffect, useRef, useState } from "react";
import { Coffee, Fuel, Wallet, Briefcase, MoreHorizontal, ArrowDownLeft, ArrowUpRight } from "lucide-react";
const shortcuts = {
  income: [["income-0","เงินเดือน",Briefcase],["income-3","เบี้ยเลี้ยง",Wallet],["income-5","อื่น ๆ",MoreHorizontal]],
  expense: [["food-1","กาแฟ",Coffee],["travel-0","น้ำมัน",Fuel],["other","อื่น ๆ",MoreHorizontal]]
} as const;
type Kind = keyof typeof shortcuts;
export default function QuickMenu({choose,close}:{choose:(k:Kind,id:string,amount?:number)=>void;close:()=>void}) {
  const [kind,setKind]=useState<Kind|null>(null), [cat,setCat]=useState("");
  const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined), held=useRef(false);
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  function finish(k:Kind,id:string,amount?:number){choose(k,id,amount);}
  const prices=cat==="food-1"?[20,25]:cat==="travel-0"?[120,500]:[];
  return <div className="quick-add-scrim" onClick={close}><section className="quick-add-options upward" role="dialog" aria-label="เพิ่มรายการ" onClick={e=>e.stopPropagation()}>
    {kind && <div className="fan-row">{shortcuts[kind].map(([id,label,Icon])=><button key={id} data-cat={id} onClick={()=>{setCat(id);if(kind==="income"||id==="other")finish(kind,id)}}><Icon/>{label}</button>)}</div>}
    {kind && prices.length>0 && <div className="fan-row price-row">{[...prices,0].map(p=><button key={p} data-price={p} onClick={()=>finish(kind,cat,p||undefined)}>{p||"ระบุ"}</button>)}</div>}
    {(["income","expense"] as const).map(k=><button key={k} className={"quick-"+k}
      onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);held.current=false;timer.current=setTimeout(()=>{held.current=true;setKind(k);setCat("")},300)}}
      onPointerMove={e=>{if(held.current){const id=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>("[data-cat]")?.dataset.cat;if(id)setCat(id)}}}
      onPointerCancel={()=>{clearTimeout(timer.current);held.current=false}}
      onPointerUp={e=>{clearTimeout(timer.current);if(!held.current)return;const el=document.elementFromPoint(e.clientX,e.clientY)?.closest<HTMLElement>("button");if(el?.dataset.price!==undefined)finish(k,cat,Number(el.dataset.price)||undefined);else if(el?.dataset.cat && (k==="income"||el.dataset.cat==="other"))finish(k,el.dataset.cat)}}
      onClick={()=>{if(!held.current)finish(k,"");held.current=false}}>{k==="income"?<ArrowDownLeft/>:<ArrowUpRight/>}{k==="income"?"รายรับ":"รายจ่าย"}</button>)}
    </section></div>
}
