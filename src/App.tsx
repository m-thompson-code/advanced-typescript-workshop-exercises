import { Dispatch, FC, SetStateAction, useState } from "react";
import "./App.scss";
import { entries } from "./output.json";
import { Box, Button, Chip, createTheme, CssBaseline, Link, Modal, SxProps, TextField, ThemeProvider } from "@mui/material";
import { FiltersProvider, useFilters } from "./filter.context";
import { stringSimilarity } from "string-similarity-js";

/**
 * Used for input placeholder
 */
function getRandomFromArray<T>(ary: T[]): T {
    return ary[Math.floor(Math.random() * ary.length)];
}

const randomExercise = getRandomFromArray(entries);

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

interface ExerciseProps {
    entry: (typeof entries)[number];
}

const Exercise: FC<ExerciseProps> = ({ entry }) => {
    const [open, setOpen] = useState(false);
    const { filterTags, filterDifficulties, onTagClick, onDifficultyClick } = useFilters();

    const tags = entry.tags.map((tag) => filterTags.find((filterTag) => filterTag.value === tag)!);
    const difficulty = filterDifficulties.find((filterDifficulty) => filterDifficulty.value === entry.difficulty)!;

    return (
        <>
        <div className="exercise">
            <span>{entry.exercise}</span>
            <Link href={entry.url} target="_blank">
                {entry.filepath}
            </Link>
            <div className="chips">
                <Chip
                    label={difficulty.display}
                    variant={difficulty.selected ? "filled" : "outlined"}
                    onClick={onDifficultyClick(difficulty.value)}
                />
                {tags.map((tag, i) => (
                    <Chip key={i} label={tag.display} variant={tag.selected ? "filled" : "outlined"} onClick={onTagClick(tag.value)} />
                ))}
            </div>
            <div>
                <Button variant="outlined" onClick={() => setOpen(true)}>Submit Solution</Button>
            </div>
        </div>
        <ExerciseModal open={open} setOpen={setOpen} />
        </>
    );
};

interface ExerciseModalProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const ExerciseModal: FC<ExerciseModalProps> = ({ open, setOpen }) => {
    const handleClose = () => setOpen(false);

    const getRows = () => {
        return Math.floor(window.screen.width / 90);
    }

    const style: SxProps = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: '90%',
        maxWidth: 1200,
        bgcolor: "background.paper",
        border: "1px solid #000",
        boxShadow: 24,
        p: 4,
    };

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
            <Box sx={style}>
                <p>Copy and paste your solution in the textarea below. All solutions are anonymous. If you want to update your solution, submit again.</p>
                <form>
                    <TextField label="Your Solution" placeholder="Copy and paste your solution here" fullWidth multiline rows={getRows()} />
                    <Button variant="contained" type="submit">Submit</Button>
                </form>
            </Box>
        </Modal>
    );
};

const Main = () => {
    const [search, setSearch] = useState("");
    const { filterTags, filterDifficulties, onTagClick, onDifficultyClick } = useFilters();

    const filteredEntries = entries.filter((entry) => {
        const includeTags = filterTags.filter((tag) => tag.selected);

        if (includeTags.some((tag) => !entry.tags.some((entryTag) => entryTag === tag.value))) {
            return false;
        }

        const includeDifficulties = filterDifficulties.filter((difficulty) => difficulty.selected);

        if (includeDifficulties.length && includeDifficulties.some((difficulty) => difficulty.value !== entry.difficulty)) {
            return false;
        }

        if (!search) {
            return true;
        }

        const cleanedSearch = search.toLowerCase().trim();
        const cleanedExercise = entry.exercise.toLowerCase().trim();

        if (cleanedExercise.includes(cleanedSearch)) {
            return true;
        }

        const similarity = stringSimilarity(cleanedExercise, cleanedSearch);
        console.log(similarity, cleanedExercise);

        return similarity > 0.5;
    });

    return (
        <>
            <form autoComplete="off">
                <TextField
                    value={search}
                    onChange={(event) => {
                        setSearch(event.target.value);
                    }}
                    label="Search"
                    variant="filled"
                    fullWidth
                    placeholder={`Ex: ${randomExercise.exercise}`}
                />
                <div className="chips">
                    {filterTags.map((chip, i) => (
                        <Chip
                            key={i}
                            label={chip.displayWithCount}
                            variant={chip.selected ? "filled" : "outlined"}
                            onClick={onTagClick(chip.value)}
                        />
                    ))}
                </div>
                <div className="chips">
                    {filterDifficulties.map((chip, i) => (
                        <Chip
                            key={i}
                            label={chip.displayWithCount}
                            variant={chip.selected ? "filled" : "outlined"}
                            onClick={onDifficultyClick(chip.value)}
                        />
                    ))}
                </div>
                <div></div>
            </form>

            <div>Search Results: {filteredEntries.length}</div>

            {filteredEntries.map((entry, i) => (
                <Exercise key={i} entry={entry} />
            ))}
        </>
    );
};

const App = () => {
    return (
        <FiltersProvider>
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <h1>Advanced TypeScript Exercises</h1>
                <Main />
            </ThemeProvider>
        </FiltersProvider>
    );
};

export default App;
