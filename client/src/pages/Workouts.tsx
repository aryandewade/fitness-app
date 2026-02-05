import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Trash2 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';

const workoutSchema = z.object({
    date: z.string(),
    type: z.string().min(1, 'Type is required'),
    notes: z.string().optional(),
    exercises: z.array(z.object({
        name: z.string().min(1, 'Name is required'),
        sets: z.coerce.number().min(1),
        reps: z.coerce.number().min(1),
        weight: z.coerce.number().optional(),
        duration: z.coerce.number().optional(),
    })),
});

type WorkoutFormValues = z.infer<typeof workoutSchema>;

interface Workout {
    id: string;
    date: string;
    type: string;
    notes?: string;
    exercises: {
        id: string;
        name: string;
        sets: number;
        reps: number;
        weight?: number;
        duration?: number;
    }[];
}

export function Workouts() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const fetchWorkouts = async () => {
        try {
            const res = await api.get('/workouts');
            setWorkouts(res.data);
        } catch (error) {
            console.error('Failed to fetch workouts', error);
        }
    };

    const form = useForm<WorkoutFormValues>({
        resolver: zodResolver(workoutSchema as any),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            type: '',
            notes: '',
            exercises: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "exercises",
    });

    const onSubmit = async (data: WorkoutFormValues) => {
        try {
            await api.post('/workouts', data);
            fetchWorkouts();
            setOpen(false);
            form.reset();
        } catch (error) {
            console.error('Failed to create workout', error);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this workout?')) {
            try {
                await api.delete(`/workouts/${id}`);
                fetchWorkouts();
            } catch (error) {
                console.error('Failed to delete workout', error);
            }
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Gym Workouts</h1>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Workout
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto sm:max-w-xl">
                        <SheetHeader>
                            <SheetTitle>Add Workout</SheetTitle>
                            <SheetDescription>
                                Log your gym session here.
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
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Workout Type</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Push, Pull, Legs" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional notes" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />




                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>Exercises</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', sets: 3, reps: 10 })}>
                                            Add Exercise
                                        </Button>
                                    </div>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-12 gap-2 items-end border p-2 rounded-md">
                                            <div className="col-span-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`exercises.${index}.name`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Bench Press" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`exercises.${index}.sets`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Sets</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`exercises.${index}.reps`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Reps</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`exercises.${index}.weight`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-xs">Kg</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" placeholder="Optional" {...field} />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button type="submit" className="w-full">Save Workout</Button>
                            </form>
                        </Form>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workouts.map((workout) => (
                    <Card key={workout.id}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-start">
                                <div>
                                    <span>{workout.type}</span>
                                    <span className="block text-sm font-normal text-muted-foreground mt-1">
                                        {new Date(workout.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={(e) => handleDelete(workout.id, e)} className="h-8 w-8 text-destructive hover:text-destructive/90">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">{workout.notes}</p>
                            <div className="space-y-1">
                                {workout.exercises?.map((ex) => (
                                    <div key={ex.id} className="text-sm">
                                        <span className="font-semibold">{ex.name}:</span> {ex.sets}x{ex.reps} {ex.weight ? `@ ${ex.weight}kg` : ''}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
