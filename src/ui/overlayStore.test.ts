import {expect,it} from 'vitest';
import {registerOverlay,overlaySnapshot} from './overlayStore';
it('keeps one highest backdrop through nested overlays and returns to none',()=>{const base=registerOverlay('dialogue',200),modal=registerOverlay('form',300),calendar=registerOverlay('calendar',500);expect(overlaySnapshot().id).toBe('calendar');calendar();expect(overlaySnapshot().id).toBe('form');modal();expect(overlaySnapshot().id).toBe('dialogue');base();expect(overlaySnapshot().level).toBe(0)});
it('a stale cleanup cannot unregister a replacement with the same key',()=>{const old=registerOverlay('same',300),replacement=registerOverlay('same',700);old();expect(overlaySnapshot().level).toBe(700);replacement();expect(overlaySnapshot().level).toBe(0)});
