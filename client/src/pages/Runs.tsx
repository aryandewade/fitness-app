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

const runSchema = z.object({
    date: z.string(),
    distance: z.coerce.number().min(0.1, 'Distance must be greater than 0'),
    duration: z.coerce.number().min(1, 'Duration must be greater than 0'),
});

type RunFormValues = z.infer<typeof runSchema>;

interface Run {
    id: string;
    date: string;
    distance: number;
    duration: number;
    pace: number;
}

export function Runs() {
    const [runs, setRuns] = useState<Run[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchRuns();
    }, []);

    const fetchRuns = async () => {
        try {
            const res = await api.get('/runs');
            setRuns(res.data);
        } catch (error) {
            console.error('Failed to fetch runs', error);
        }
    };

    const form = useForm<RunFormValues>({
        resolver: zodResolver(runSchema) as any,
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            distance: 0,
            duration: 0,
        },
    });

    const onSubmit = async (data: RunFormValues) => {
        try {
            await api.post('/runs', data);
            fetchRuns();
            setOpen(false);
            form.reset();
        } catch (error) {
            console.error('Failed to log run', error);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Run Tracker</h1>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Log Run
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Log Run</SheetTitle>
                            <SheetDescription>
                                Track your running performance.
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
                                    name="distance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Distance (km)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
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
                                            <FormLabel>Duration (minutes)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Save Run</Button>
                            </form>
                        </Form>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {runs.map((run) => (
                    <Card key={run.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {new Date(run.date).toLocaleDateString()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium">Distance</p>
                                    <p className="text-2xl font-bold">{run.distance} km</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Duration</p>
                                    <p className="text-2xl font-bold">{run.duration} min</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Pace</p>
                                    <p className="text-2xl font-bold">{run.pace?.toFixed(2)} min/km</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
