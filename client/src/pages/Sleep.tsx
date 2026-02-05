import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus } from 'lucide-react';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const sleepSchema = z.object({
    date: z.string(),
    duration: z.coerce.number().min(1, 'Duration must be greater than 0'),
    quality: z.coerce.number().min(1).max(5),
    bedTime: z.string().optional(),
    wakeTime: z.string().optional(),
});

type SleepFormValues = z.infer<typeof sleepSchema>;

interface SleepLog {
    id: string;
    date: string;
    duration: number;
    quality: number;
    bedTime?: string;
    wakeTime?: string;
}

export function Sleep() {
    const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchSleepLogs();
    }, []);

    const fetchSleepLogs = async () => {
        try {
            const res = await api.get('/sleep');
            setSleepLogs(res.data);
        } catch (error) {
            console.error('Failed to fetch sleep logs', error);
        }
    };

    const form = useForm<SleepFormValues>({
        resolver: zodResolver(sleepSchema) as any,
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            duration: 0,
            quality: 3,
        },
    });

    const onSubmit = async (data: SleepFormValues) => {
        try {
            await api.post('/sleep', data);
            fetchSleepLogs();
            setOpen(false);
            form.reset();
        } catch (error) {
            console.error('Failed to log sleep', error);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Sleep Tracker</h1>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Log Sleep
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Log Sleep</SheetTitle>
                            <SheetDescription>
                                Monitor your sleep quality.
                            </SheetDescription>
                        </SheetHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (hours)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.5" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="quality"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quality (1-5)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" max="5" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bedTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bed Time</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="wakeTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Wake Time</FormLabel>
                                            <FormControl>
                                                <Input type="datetime-local" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Save Sleep Log</Button>
                            </form>
                        </Form>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sleepLogs.map((log) => (
                    <Card key={log.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {new Date(log.date).toLocaleDateString()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Duration</p>
                                    <p className="text-2xl font-bold">{log.duration} hrs</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Quality</p>
                                    <p className="text-2xl font-bold">{log.quality}/5</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
