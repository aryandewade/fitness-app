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
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const weightSchema = z.object({
    date: z.string(),
    weight: z.coerce.number().min(1, 'Weight must be greater than 0'),
    bodyFat: z.coerce.number().optional(),
});

type WeightFormValues = z.infer<typeof weightSchema>;

interface WeightLog {
    id: string;
    date: string;
    weight: number;
    bodyFat?: number;
}

export function Weight() {
    const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchWeightLogs();
    }, []);

    const fetchWeightLogs = async () => {
        try {
            const res = await api.get('/weight');
            setWeightLogs(res.data);
        } catch (error) {
            console.error('Failed to fetch weight logs', error);
        }
    };

    const form = useForm<WeightFormValues>({
        resolver: zodResolver(weightSchema) as any,
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            weight: 0,
            bodyFat: 0,
        },
    });

    const onSubmit = async (data: WeightFormValues) => {
        try {
            await api.post('/weight', data);
            fetchWeightLogs();
            setOpen(false);
            form.reset();
        } catch (error) {
            console.error('Failed to log weight', error);
        }
    };

    // Prepare data for chart (reverse order for chronological)
    const chartData = [...weightLogs].reverse().map(log => ({
        date: new Date(log.date).toLocaleDateString(),
        weight: log.weight
    }));

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Weight Tracker</h1>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Log Weight
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Log Weight</SheetTitle>
                            <SheetDescription>
                                Track your body weight.
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
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Weight (kg)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bodyFat"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Body Fat %</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="Optional" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Save Weight Log</Button>
                            </form>
                        </Form>
                    </SheetContent>
                </Sheet>
            </div>

            {chartData.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Weight Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <XAxis dataKey="date" />
                                <YAxis domain={['auto', 'auto']} />
                                <Tooltip />
                                <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {weightLogs.map((log) => (
                    <Card key={log.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {new Date(log.date).toLocaleDateString()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium">Weight</p>
                                    <p className="text-2xl font-bold">{log.weight} kg</p>
                                </div>
                                {log.bodyFat && (
                                    <div>
                                        <p className="text-sm font-medium">Body Fat</p>
                                        <p className="text-2xl font-bold">{log.bodyFat}%</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
