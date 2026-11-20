import {useEffect,useId,useSyncExternalStore} from 'react';
import {overlaySnapshot,subscribeOverlays,registerOverlay} from './overlayStore';
export function useOverlay(active:boolean,level=300){const id=useId();useEffect(()=>active?registerOverlay(id,level):undefined,[active,id,level]);return id}
export function useOverlayTop(){return useSyncExternalStore(subscribeOverlays,overlaySnapshot,overlaySnapshot)}
export default function SharedBackdrop(){const top=useOverlayTop();return <div className="shared-backdrop" aria-hidden="true" data-active={top.level>0?'true':'false'} style={{zIndex:top.level?top.level-1:0}}/>}
export function overlayHost(){return document.getElementById('overlay-host')||document.body}
