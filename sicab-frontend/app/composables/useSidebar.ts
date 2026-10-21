// C:\sistemas\sicab\sicab-frontend\app\composables\useSidebar.ts
export const useSidebar = () => {
    const isOpen = useState<boolean>('sidebar-open', () => true);
    const toggle = () => { isOpen.value = !isOpen.value; };
    const open   = () => { isOpen.value = true;  };
    const close  = () => { isOpen.value = false; };
    return { isOpen, toggle, open, close };
};
