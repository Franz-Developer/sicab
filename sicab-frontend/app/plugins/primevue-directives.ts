// C:\sistemas\sicab\sicab-frontend\app\plugins\primevue-directives.ts
import Tooltip from 'primevue/tooltip';

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('tooltip', Tooltip);
});
