import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Footprints, Moon, Scale, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import clsx from 'clsx';

export function AppLayout() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/workouts', label: 'Workouts', icon: Dumbbell },
        { href: '/runs', label: 'Runs', icon: Footprints },
        { href: '/sleep', label: 'Sleep', icon: Moon },
        { href: '/weight', label: 'Weight', icon: Scale },
    ];

    const NavContent = () => (
        <nav className="space-y-2 p-4">
            {navItems.map((item) => (
                <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                        clsx(
                            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                            'hover:bg-accent hover:text-accent-foreground',
                            isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'
                        )
                    }
                >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 border-r bg-card/50 backdrop-blur-sm fixed h-full z-30">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-tight">Fitness Tracker</h1>
                </div>
                <NavContent />
            </aside>

            {/* Mobile Sidebar */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-sm flex items-center px-4 z-50">
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <div className="p-6">
                            <h1 className="text-xl font-bold tracking-tight">Fitness Tracker</h1>
                        </div>
                        <NavContent />
                    </SheetContent>
                </Sheet>
                <span className="font-semibold ml-4">Fitness Tracker</span>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
