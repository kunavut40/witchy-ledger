import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {type Period,thaiDate} from './domain';
import {useExitMotion} from './motion';
import {overlayHost,useOverlay} from './ui/SharedBackdrop';
export default function PeriodManager({periods,selected,select,edit,add,muted=false}:{periods:Period[];selected:Period;select:(id:string)=>void;edit:(p:Period)=>void;add:()=>void;muted?:boolean}){
 const [open,setOpen]=useState(false);
 const {leaving,dismiss}=useExitMotion(()=>setOpen(false),muted);
 useOverlay(open,400);
 useEffect(()=>{if(!open)return;const back=(e:Event)=>{e.preventDefault();e.stopImmediatePropagation();dismiss()};const key=(e:KeyboardEvent)=>{if(e.key==='Escape')back(e)};window.addEventListener('witchy-overlay-back',back);window.addEventListener('keydown',key,true);return()=>{window.removeEventListener('witchy-overlay-back',back);window.removeEventListener('keydown',key,true)}},[open,dismiss]);
 return <><button className="period-manager-trigger" aria-label="เลือกรอบบัญชี" aria-haspopup="dialog" onClick={()=>setOpen(true)}>{selected.name} ▾</button>{open&&createPortal(<div className={'period-manager-overlay '+(leaving?'motion-leaving':'')} onClick={dismiss}><section className="period-manager" role="dialog" aria-modal="true" aria-label="เลือกรอบบัญชี" onClick={e=>e.stopPropagation()}><header><h2>✦ รอบบัญชี</h2><button aria-label="ปิดตัวเลือกรอบบัญชี" onClick={dismiss}>×</button></header><div className="period-manager-list">{periods.slice().sort((a,b)=>b.start.localeCompare(a.start)).map(p=><article key={p.id} data-selected={p.id===selected.id}><button aria-pressed={p.id===selected.id} onClick={()=>{select(p.id);dismiss()}}><b>{p.name}</b><small>{thaiDate(p.start,true)} — {thaiDate(p.end,true)}</small></button><button aria-label={'แก้ไข '+p.name} onClick={()=>{setOpen(false);edit(p)}}>แก้ไข</button></article>)}</div><button className="primary" onClick={()=>{setOpen(false);add()}}>＋ เพิ่มรอบบัญชี</button></section></div>,overlayHost())}</>
}
