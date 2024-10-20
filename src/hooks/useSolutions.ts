import { useEffect, useState } from "react"
import { ExerciseSolutions, getSolutions } from "../firebase"

// const getMockSolution = () => {
//     return {
//         value: 'hello world',
//         timestamp: Date.now()
//     }
// }

// const getMockSolutions = (solutions: ExerciseSolutions) => {
//     Object.entries(solutions).map(([_, solutions]) => {
//         solutions.push(getMockSolution());
//         solutions.push(getMockSolution());
//         solutions.push(getMockSolution());
//         return solutions;
//     });
//     return solutions;
// }

// export const getSolutions = (callback: (solutions: ExerciseSolutions) => void) => {
//     setTimeout(() => {
//         callback(getMockSolutions(getEmptySolutions()));
//     }, 300);
// };

export const useSolutions = (): ExerciseSolutions | null => {
    const [solutions, setSolutions] = useState<ExerciseSolutions | null>(null);

    useEffect(() => {
        const unsub = getSolutions(setSolutions);

        return () => {
            unsub();
        }
    }, []);

    return solutions;
};
