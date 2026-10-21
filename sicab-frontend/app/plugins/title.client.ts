// C:\sistemas\sicab\sicab-frontend\app\plugins\title.client.ts
export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const appName = config.public.appName || '';

    useHead({
        title: appName,
        titleTemplate: (titleChunk) => {
            return titleChunk ? `${titleChunk} | ${appName}` : appName;
        },
    });
});
