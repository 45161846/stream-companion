import { defineContentScript } from 'wxt/utils/define-content-script';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import '../../src/components/panel.css';
import { mountCompanion } from '../../src/twitch/mount';

export default defineContentScript({
  matches:['https://www.twitch.tv/*'],
  cssInjectionMode:'ui',
  async main(ctx) {
    const ui=await createShadowRootUi(ctx,{
      name:'stream-companion',
      position:'inline',
      anchor:'main.twilight-main',
      append:'after',
      isolateEvents:true,
      // panel.css owns the reset; WXT's !important reset would override the flex host.
      inheritStyles:true,
      onMount(container,_shadow,host) { return mountCompanion(container,host); },
      onRemove(mounted) { mounted?.destroy(); },
    });
    ui.autoMount();
    ctx.onInvalidated(()=>ui.remove());
  },
});
