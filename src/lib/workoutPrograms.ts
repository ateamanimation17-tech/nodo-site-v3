export type Exercise = { name: string; sets: number; reps: string; videoId?: string };
export type WorkoutDay = { label: string; exercises: Exercise[] };

export const WORKOUT_SPLITS: Record<number, WorkoutDay[]> = {
  3: [
    {
      label: "Full Body A",
      exercises: [
        { name: "Barbell Back Squat", sets: 3, reps: "8", videoId: "dW3zj79xfrc" },
        { name: "Bench Press", sets: 3, reps: "8", videoId: "hWbUlkb5Ms4" },
        { name: "Bent-Over Row", sets: 3, reps: "10", videoId: "qXrTDQG1oUQ" },
        { name: "Overhead Press", sets: 3, reps: "10", videoId: "KP1sYz2VICk" },
        { name: "Plank", sets: 3, reps: "45s", videoId: "v25dawSzRTM" },
      ],
    },
    {
      label: "Full Body B",
      exercises: [
        { name: "Deadlift", sets: 3, reps: "6", videoId: "ZaTM37cfiDs" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10", videoId: "8fXfwG4ftaQ" },
        { name: "Pull-Up / Lat Pulldown", sets: 3, reps: "8", videoId: "bNmvKpJSWKM" },
        { name: "Walking Lunge", sets: 3, reps: "12/leg", videoId: "P5W2mvm1aGE" },
        { name: "Hanging Leg Raise", sets: 3, reps: "12", videoId: "2n4UqRIJyk4" },
      ],
    },
    {
      label: "Full Body C",
      exercises: [
        { name: "Front Squat", sets: 3, reps: "8", videoId: "_qv0m3tPd3s" },
        { name: "Overhead Press", sets: 3, reps: "8", videoId: "KP1sYz2VICk" },
        { name: "Seated Cable Row", sets: 3, reps: "10", videoId: "qD1WZ5pSuvk" },
        { name: "Romanian Deadlift", sets: 3, reps: "10", videoId: "5rIqP63yWFg" },
        { name: "Side Plank", sets: 3, reps: "30s/side", videoId: "BFOyHDlY2UE" },
      ],
    },
  ],
  4: [
    {
      label: "Upper A",
      exercises: [
        { name: "Bench Press", sets: 4, reps: "8", videoId: "hWbUlkb5Ms4" },
        { name: "Bent-Over Row", sets: 4, reps: "8", videoId: "qXrTDQG1oUQ" },
        { name: "Overhead Press", sets: 3, reps: "10", videoId: "KP1sYz2VICk" },
        { name: "Lat Pulldown", sets: 3, reps: "10", videoId: "bNmvKpJSWKM" },
        { name: "Bicep Curl", sets: 3, reps: "12", videoId: "MKWBV29S6c0" },
        { name: "Tricep Pushdown", sets: 3, reps: "12", videoId: "1FjkhpZsaxc" },
      ],
    },
    {
      label: "Lower A",
      exercises: [
        { name: "Back Squat", sets: 4, reps: "8", videoId: "dW3zj79xfrc" },
        { name: "Romanian Deadlift", sets: 3, reps: "10", videoId: "5rIqP63yWFg" },
        { name: "Leg Press", sets: 3, reps: "12", videoId: "nDh_BlnLCGc" },
        { name: "Leg Curl", sets: 3, reps: "12", videoId: "_lgE0gPvbik" },
        { name: "Standing Calf Raise", sets: 4, reps: "15", videoId: "baEXLy09Ncc" },
      ],
    },
    {
      label: "Upper B",
      exercises: [
        { name: "Incline Dumbbell Press", sets: 4, reps: "10", videoId: "8fXfwG4ftaQ" },
        { name: "Pull-Up", sets: 4, reps: "AMRAP", videoId: "OEXosPwzFdc" },
        { name: "Seated Dumbbell Shoulder Press", sets: 3, reps: "10", videoId: "k6tzKisR3NY" },
        { name: "Cable Row", sets: 3, reps: "10", videoId: "qD1WZ5pSuvk" },
        { name: "Hammer Curl", sets: 3, reps: "12", videoId: "lmIo_gVE8T4" },
        { name: "Overhead Tricep Extension", sets: 3, reps: "12", videoId: "b5le--KkyH0" },
      ],
    },
    {
      label: "Lower B",
      exercises: [
        { name: "Deadlift", sets: 4, reps: "6", videoId: "ZaTM37cfiDs" },
        { name: "Front Squat", sets: 3, reps: "8", videoId: "_qv0m3tPd3s" },
        { name: "Walking Lunge", sets: 3, reps: "12/leg", videoId: "P5W2mvm1aGE" },
        { name: "Leg Extension", sets: 3, reps: "12", videoId: "uM86QE59Tgc" },
        { name: "Seated Calf Raise", sets: 4, reps: "15", videoId: "BxfKOyI8sUg" },
      ],
    },
  ],
  5: [
    {
      label: "Push",
      exercises: [
        { name: "Bench Press", sets: 4, reps: "8", videoId: "hWbUlkb5Ms4" },
        { name: "Overhead Press", sets: 3, reps: "10", videoId: "KP1sYz2VICk" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10", videoId: "8fXfwG4ftaQ" },
        { name: "Lateral Raise", sets: 3, reps: "15", videoId: "Kl3LEzQ5Zqs" },
        { name: "Tricep Pushdown", sets: 3, reps: "12", videoId: "1FjkhpZsaxc" },
      ],
    },
    {
      label: "Pull",
      exercises: [
        { name: "Deadlift", sets: 3, reps: "6", videoId: "ZaTM37cfiDs" },
        { name: "Pull-Up", sets: 4, reps: "AMRAP", videoId: "OEXosPwzFdc" },
        { name: "Bent-Over Row", sets: 3, reps: "10", videoId: "qXrTDQG1oUQ" },
        { name: "Face Pull", sets: 3, reps: "15", videoId: "IeOqdw9WI90" },
        { name: "Bicep Curl", sets: 3, reps: "12", videoId: "MKWBV29S6c0" },
      ],
    },
    {
      label: "Legs",
      exercises: [
        { name: "Back Squat", sets: 4, reps: "8", videoId: "dW3zj79xfrc" },
        { name: "Romanian Deadlift", sets: 3, reps: "10", videoId: "5rIqP63yWFg" },
        { name: "Leg Press", sets: 3, reps: "12", videoId: "nDh_BlnLCGc" },
        { name: "Leg Curl", sets: 3, reps: "12", videoId: "_lgE0gPvbik" },
        { name: "Standing Calf Raise", sets: 4, reps: "15", videoId: "baEXLy09Ncc" },
      ],
    },
    {
      label: "Upper",
      exercises: [
        { name: "Incline Bench Press", sets: 3, reps: "10", videoId: "98HWfiRonkE" },
        { name: "Seated Row", sets: 3, reps: "10", videoId: "qD1WZ5pSuvk" },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: "10", videoId: "k6tzKisR3NY" },
        { name: "Lat Pulldown", sets: 3, reps: "10", videoId: "bNmvKpJSWKM" },
        { name: "Bicep Curl", sets: 3, reps: "12", videoId: "MKWBV29S6c0" },
        { name: "Tricep Pushdown", sets: 3, reps: "12", videoId: "1FjkhpZsaxc" },
      ],
    },
    {
      label: "Lower",
      exercises: [
        { name: "Front Squat", sets: 3, reps: "8", videoId: "_qv0m3tPd3s" },
        { name: "Walking Lunge", sets: 3, reps: "12/leg", videoId: "P5W2mvm1aGE" },
        { name: "Hip Thrust", sets: 3, reps: "12", videoId: "_i6qpcI1Nw4" },
        { name: "Leg Extension", sets: 3, reps: "12", videoId: "uM86QE59Tgc" },
        { name: "Standing Calf Raise", sets: 4, reps: "15", videoId: "baEXLy09Ncc" },
      ],
    },
  ],
};
