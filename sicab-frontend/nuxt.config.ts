// C:\sistemas\sicab\sicab-frontend\nuxt.config.ts
import Aura from '@primeuix/themes/aura';

export default defineNuxtConfig({
    future: {
        compatibilityVersion: 4,
    },
    compatibilityDate: '2025-07-15',
    css: [
        'primeicons/primeicons.css',
        '@/assets/css/main.postcss'
    ],
    devtools: { enabled: false },
    components: [
        { path: '~/components', pathPrefix: false },
    ],
    routeRules: {
        '/**': { ssr: false }
    },
    features: {
        inlineStyles: true,
    },

    experimental: {
        payloadExtraction: false,
        renderJsonPayloads: false,
        asyncContext: true,
        scanPageMeta: false,
    },
    app: {
        head: {
            title: 'sicab',
            meta: [{ name: 'description', content: 'Sistema de Control PRO' }],
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/nave.ico' },
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
            ]
        }
    },
    typescript: {
        typeCheck: false,
        strict: true,
        tsConfig: {
            compilerOptions: {
                noUnusedLocals: true,
                noUnusedParameters: true,
            },
        },
    },
    runtimeConfig: {
        public: {
            apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3010',
            apiPredict: process.env.NUXT_PUBLIC_API_PREDICT || 'http://localhost:8000',
            appName: process.env.NUXT_PUBLIC_APP_NAME || 'sicab',
            appVersion: process.env.NUXT_PUBLIC_APP_VERSION || '1.0',
        },
    },
    devServer: {
        host: process.env.NUXT_HOST || '127.0.0.1',
        port: Number(process.env.NUXT_PORT) || 3012,
    },
    modules: [
        '@pinia/nuxt',
        '@primevue/nuxt-module',
        '@nuxtjs/tailwindcss',
        '@vueuse/nuxt',
        'nuxt-delay-hydration',
        '@nuxtjs/leaflet',
    ],
    leaflet: {
        injectCss: true,
    },

    // @ts-ignore - El módulo nuxt-delay-hydration no expone tipos globales
    delayHydration: {
        mode: 'init',
        debug: process.env.NODE_ENV === 'development',
    },
    primevue: {
        autoImport: true,
        components: {
            include: [
                'Toast',
                'PanelMenu',
                'Dialog',
                'Popover',
                'Password',
                'Tag',
                'Button',
                'Badge',
                'InputText',
                'Select',
                'DataTable',
                'Column',
                'Tooltip',
                'Menu',
            ],
        },
        options: {
            ripple: true,
            locale: {
                firstDayOfWeek: 1,
                dayNames: ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],
                dayNamesShort: ["dom","lun","mar","mié","jue","vie","sáb"],
                dayNamesMin: ["D","L","M","X","J","V","S"],
                monthNames: ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
                monthNamesShort: ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"],
                today: 'Hoy',
                clear: 'Limpiar',
                dateFormat: 'yy-mm-dd',
                weekHeader: 'Sm',
                pending: 'Pendiente',
                chooseYear: 'Elegir Año',
                chooseMonth: 'Elegir Mes',
                chooseDate: 'Elegir Fecha',
                prevDecade: 'Década Anterior',
                nextDecade: 'Década Siguiente',
                prevYear: 'Año Anterior',
                nextYear: 'Año Siguiente',
                prevMonth: 'Mes Anterior',
                nextMonth: 'Mes Siguiente',
                prevHour: 'Hora Anterior',
                nextHour: 'Hora Siguiente',
                prevMinute: 'Minuto Anterior',
                nextMinute: 'Minuto Siguiente',
                prevSecond: 'Segundo Anterior',
                nextSecond: 'Segundo Siguiente',
                am: 'am',
                pm: 'pm',
                fileSizeTypes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
            },
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: 'html.dark',
                    cssLayer: {
                        name: 'primevue',
                        order: 'tailwind-base, primevue, tailwind-utilities'
                    }
                }
            }
        }
    },
    vite: {
        optimizeDeps: {
            include: [
                'js-cookie',
                'jwt-decode',
                'chart.js',
                'leaflet',
                'primevue/popover',
                'primevue/overlayeventbus',
                'primevue/toast',
                'primevue/tag',
                'primevue/dialog',
                'primevue/password',
                'primevue/select',
                'primevue/datatable',
                'primevue/column',
                'primevue/inputtext',
                'primevue/button',
                'primevue/badge',
                'primevue/panelmenu',
                'primevue/tooltip',
                'primevue/menu',
            ],
        },
        build: {
            cssCodeSplit: true,
            reportCompressedSize: false,
            chunkSizeWarningLimit: 1500,
        },
    },
});
