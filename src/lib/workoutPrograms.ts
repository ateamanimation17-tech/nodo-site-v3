export type Exercise = { name: string; sets: number; reps: string; videoId?: string };
export type WorkoutDay = { label: string; exercises: Exercise[] };

export const WORKOUT_SPLITS: Record<number, WorkoutDay[]> = {
  3: [
    {
      label: "Full Body A",
      exercises: [
        { name: "Barbell Back Squat", sets: 3, reps: "8" },
        { name: "Bench Press", sets: 3, reps: "8" },
        { name: "Bent-Over Row", sets: 3, reps: "10" },
        { name: "Overhead Press", sets: 3, reps: "10" },
        { name: "Plank", sets: 3, reps: "45s" },
      ],
    },
    {
      label: "Full Body B",
      exercises: [
        { name: "Deadlift", sets: 3, reps: "6" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10" },
        { name: "Pull-Up / Lat Pulldown", sets: 3, reps: "8" },
        { name: "Walking Lunge", sets: 3, reps: "12/leg" },
        { name: "Hanging Leg Raise", sets: 3, reps: "12" },
      ],
    },
    {
      label: "Full Body C",
      exercises: [
        { name: "Front Squat", sets: 3, reps: "8" },
        { name: "Overhead Press", sets: 3, reps: "8" },
        { name: "Seated Cable Row", sets: 3, reps: "10" },
        { name: "Romanian Deadlift", sets: 3, reps: "10" },
        { name: "Side Plank", sets: 3, reps: "30s/side" },
      ],
    },
  ],
  4: [
    {
      label: "Upper A",
      exercises: [
        { name: "Bench Press", sets: 4, reps: "8" },
        { name: "Bent-Over Row", sets: 4, reps: "8" },
        { name: "Overhead Press", sets: 3, reps: "10" },
        { name: "Lat Pulldown", sets: 3, reps: "10" },
        { name: "Bicep Curl", sets: 3, reps: "12" },
        { name: "Tricep Pushdown", sets: 3, reps: "12" },
      ],
    },
    {
      label: "Lower A",
      exercises: [
        { name: "Back Squat", sets: 4, reps: "8" },
        { name: "Romanian Deadlift", sets: 3, reps: "10" },
        { name: "Leg Press", sets: 3, reps: "12" },
        { name: "Leg Curl", sets: 3, reps: "12" },
        { name: "Standing Calf Raise", sets: 4, reps: "15" },
      ],
    },
    {
      label: "Upper B",
      exercises: [
        { name: "Incline Dumbbell Press", sets: 4, reps: "10" },
        { name: "Pull-Up", sets: 4, reps: "AMRAP" },
        { name: "Seated Dumbbell Shoulder Press", sets: 3, reps: "10" },
        { name: "Cable Row", sets: 3, reps: "10" },
        { name: "Hammer Curl", sets: 3, reps: "12" },
        { name: "Overhead Tricep Extension", sets: 3, reps: "12" },
      ],
    },
    {
      label: "Lower B",
      exercises: [
        { name: "Deadlift", sets: 4, reps: "6" },
        { name: "Front Squat", sets: 3, reps: "8" },
        { name: "Walking Lunge", sets: 3, reps: "12/leg" },
        { name: "Leg Extension", sets: 3, reps: "12" },
        { name: "Seated Calf Raise", sets: 4, reps: "15" },
      ],
    },
  ],
  5: [
    {
      label: "Push",
      exercises: [
        { name: "Bench Press", sets: 4, reps: "8" },
        { name: "Overhead Press", sets: 3, reps: "10" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10" },
        { name: "Lateral Raise", sets: 3, reps: "15" },
        { name: "Tricep Pushdown", sets: 3, reps: "12" },
      ],
    },
    {
      label: "Pull",
      exercises: [
        { name: "Deadlift", sets: 3, reps: "6" },
        { name: "Pull-Up", sets: 4, reps: "AMRAP" },
        { name: "Bent-Over Row", sets: 3, reps: "10" },
        { name: "Face Pull", sets: 3, reps: "15" },
        { name: "Bicep Curl", sets: 3, reps: "12" },
      ],
    },
    {
      label: "Legs",
      exercises: [
        { name: "Back Squat", sets: 4, reps: "8" },
        { name: "Romanian Deadlift", sets: 3, reps: "10" },
        { name: "Leg Press", sets: 3, reps: "12" },
        { name: "Leg Curl", sets: 3, reps: "12" },
        { name: "Standing Calf Raise", sets: 4, reps: "15" },
      ],
    },
    {
      label: "Upper",
      exercises: [
        { name: "Incline Bench Press", sets: 3, reps: "10" },
        { name: "Seated Row", sets: 3, reps: "10" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10" },
        { name: "Lat Pulldown", sets: 3, reps: "10" },
        { name: "Bicep Curl", sets: 3, reps: "12" },
        { name: "Tricep Pushdown", sets: 3, reps: "12" },
      ],
    },
    {
      label: "Lower",
      exercises: [
        { name: "Front Squat", sets: 3, reps: "8" },
        { name: "Walking Lunge", sets: 3, reps: "12/leg" },
        { name: "Hip Thrust", sets: 3, reps: "12" },
        { name: "Leg Extension", sets: 3, reps: "12" },
        { name: "Standing Calf Raise", sets: 4, reps: "15" },
      ],
    },
  ],
};
