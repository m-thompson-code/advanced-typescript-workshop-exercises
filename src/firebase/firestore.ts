import { getFirestore, onSnapshot, collection, query, doc, setDoc } from "firebase/firestore";
import { app } from "./app";
import { getUser } from "./user";
import { entries } from "../output.json";

export interface Solution {
    value: string;
    timestamp: number;
}

export interface UserSolutions {
    [userId: string]: Solution[];
}

export interface ExerciseSolutions {
    [exercise: string]: Solution[];
}

const getEmptySolutions = () => {
    return entries.reduce((map, entry) => {
        map[entry.filename] = [];
        return map;
    }, {} as Record<string, Solution[]>);
};

const db = getFirestore(app);

export const getSolutions = (callback: (solutions: ExerciseSolutions) => void) => {
    return onSnapshot(query(collection(db, "solutions")), (querySnapshot) => {
        const solutions: UserSolutions = getEmptySolutions();

        querySnapshot.forEach((doc) => {
            const userSolutions = doc.data() as Solution;
            Object.entries(userSolutions).forEach(([exercise, solution]) => {
                solutions[exercise] ??= [];
                solutions[exercise].push(solution);
            });
        });
        Object.entries(solutions).forEach(([exercise, solution]) => {
            solutions[exercise] = solution.sort((a, b) => a.timestamp - b.timestamp);
        });
        callback(solutions);
    });
};

export const setSolution = async (exercise: string, solution: string) => {
    const userId = getUser()?.uid;

    if (!userId) {
        throw new Error("user is not authorized");
    }

    const ref = doc(db, "solutions", userId);

    const update = {
        [exercise]: {
            value: solution,
            timestamp: Date.now(),
        },
    } as {
        exercise: Solution;
    };

    await setDoc(ref, update, { merge: true });
};
