import "./Solutions.scss";
import { entries } from "../output.json";
import { useSolutions } from "../hooks";
import { FC, useState } from "react";
import { Accordion, AccordionSummary, Box, createTheme, CssBaseline, TextField, ThemeProvider, Typography } from "@mui/material";
import { Solution } from "../firebase";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

interface ExerciseProps {
    entry: (typeof entries)[number];
    solutions: Solution[];
}

const Exercise: FC<ExerciseProps> = ({ solutions }) => {   
    return (
        <>
            <div className="solutions">
                {solutions.map((solution) => (
                    <Box>
                        <TextField
                            key={solution.timestamp}
                            value={solution.value}
                            label={new Date(solution.timestamp).toTimeString()}
                            placeholder="Empty"
                            fullWidth
                            multiline
                            rows={6}
                        />
                    </Box>
                ))}
            </div>
        </>
    );
};

export const Solutions = () => {
    const solutions = useSolutions();
    const [expanded, setExpanded] = useState("");

    if (!solutions) {
        return (
            <>
                <h1>Solutions</h1>
                <p>Loading...</p>
            </>
        );
    }

    const handleAccordionOnChange = (entry: typeof entries[number]) => () => {
        const value = entry.filename
        if (expanded === value) {
            setExpanded('');
        } else {
            setExpanded(value)
        }
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <h1>Solutions</h1>
            {entries.map((entry) => {
                const exerciseSolutions = solutions[entry.filename];

                return (
                    <Accordion key={entry.filename} expanded={expanded === entry.filename} onChange={handleAccordionOnChange(entry)}>
                        <AccordionSummary>
                            <Typography>
                                {entry.exercise} ({exerciseSolutions.length})
                            </Typography>
                        </AccordionSummary>
                        <Exercise entry={entry} solutions={exerciseSolutions} />
                    </Accordion>
                );
            })}
        </ThemeProvider>
    );
};
