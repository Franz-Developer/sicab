<!-- C:\sistemas\sicab\sicab-frontend\app\pages\principal.vue -->
<template>
    <PrincipalView />
</template>

<script setup>
    onMounted(() => {
        const navStart = sessionStorage.getItem('login_start');

        if (navStart) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const totalRender = performance.now() - Number(navStart);
                    console.log(
                        `%c🎨 /principal renderizado: ${totalRender.toFixed(2)}ms`,
                        'background: #8b5cf6; color: white; padding: 2px 6px; border-radius: 4px'
                    );

                    const totalStart = sessionStorage.getItem('login_total_start');
                    if (totalStart) {
                        const totalAbsoluto = performance.now() - Number(totalStart);
                        console.log(
                            `%c🏆 TOTAL LOGIN → RENDER: ${totalAbsoluto.toFixed(2)}ms`,
                            'background: #22c55e; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold'
                        );
                    }

                    sessionStorage.removeItem('login_start');
                    sessionStorage.removeItem('login_total_start');
                });
            });
        }
    });
</script>
