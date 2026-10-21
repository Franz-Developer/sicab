// C:\sistemas\sicab\sicab-frontend\types\nuxt.d.ts

declare module 'nuxt-delay-hydration' {
    import type { ModuleOptions } from 'nuxt-delay-hydration/dist/module'

    interface DelayHydrationOptions {
        mode?: 'init' | 'mount' | 'manual' | false
        debug?: boolean
        postIdleTimeout?: number | { mobile?: number; desktop?: number }
        idleCallbackTimeout?: number
        restartOnNavigation?: boolean
        replayClick?: boolean
    }

    const _default: any
    export default _default
}

declare module '@nuxt/schema' {
    interface NuxtConfig {
        delayHydration?: {
            mode?: 'init' | 'mount' | 'manual' | false
            debug?: boolean
            postIdleTimeout?: number | { mobile?: number; desktop?: number }
            idleCallbackTimeout?: number
            restartOnNavigation?: boolean
            replayClick?: boolean
        }
    }

    interface PublicRuntimeConfig {
        // Nada extra
    }
}

export {}
