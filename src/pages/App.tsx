import { Dispatch, FC, FormEventHandler, SetStateAction, useState } from "react";
import "./App.scss";
import { entries } from "../output.json";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    createTheme,
    CssBaseline,
    Link,
    Modal,
    Snackbar,
    SxProps,
    TextField,
    ThemeProvider,
} from "@mui/material";
import { FiltersProvider, useFilters } from "../filter.context";
import { stringSimilarity } from "string-similarity-js";
import { setSolution } from "../firebase";

const darkTheme = createTheme({
    palette: {
        mode: "dark",
    },
});

/**
 * Used for input placeholder
 */
function getRandomFromArray<T>(ary: T[]): T {
    return ary[Math.floor(Math.random() * ary.length)];
}

const randomExercise = getRandomFromArray(entries);

interface ExerciseProps {
    entry: (typeof entries)[number];
}

const Exercise: FC<ExerciseProps> = ({ entry }) => {
    const [open, setOpen] = useState(false);
    const { filterTags, filterComplexities, onTagClick, onDifficultyClick } = useFilters();

    const tags = entry.tags.map((tag) => filterTags.find((filterTag) => filterTag.value === tag)!);
    const complexity = filterComplexities.find((filterComplexity) => Number(filterComplexity.value) === entry.complexity)!;

    return (
        <>
            <div className="exercise">
                <span>{entry.exercise}</span>
                <Link href={entry.url} target="_blank">
                    {entry.filepath}
                </Link>
                <div className="chips">
                    <Chip
                        label={complexity.display}
                        variant={complexity.selected ? "filled" : "outlined"}
                        onClick={onDifficultyClick(complexity.value)}
                    />
                    {tags.map((tag) => (
                        <Chip key={tag.displayWithCount} label={tag.display} variant={tag.selected ? "filled" : "outlined"} onClick={onTagClick(tag.value)} />
                    ))}
                </div>
                <div>
                    <Button variant="outlined" onClick={() => setOpen(true)}>
                        Submit Solution
                    </Button>
                </div>
            </div>
            <ExerciseModal exercise={entry.filename} open={open} setOpen={setOpen} />
        </>
    );
};

const Loader: FC = () => {
    return (
        <div className="loader">
            <CircularProgress />
        </div>
    );
};

interface ExerciseModalProps {
    exercise: string;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const ExerciseModal: FC<ExerciseModalProps> = ({ exercise, open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const [value, setValue] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFailure, setShowFailure] = useState(false);
    const handleClose = () => setOpen(false);

    const getRows = () => {
        return Math.floor(window.screen.width / 90);
    };

    const style: SxProps = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: 1200,
        bgcolor: "background.paper",
        border: "1px solid #000",
        boxShadow: 24,
        p: 4,
    };

    const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setLoading(true);
        try {
            await setSolution(exercise, value);
            setShowSuccess(true);
        } catch (e) {
            console.error(e);
            setShowFailure(true);
        }
        setLoading(false);
    };

    const handleCloseToast = () => {
        setShowSuccess(false);
        setShowFailure(false);
    };

    return (
        <>
            <Snackbar open={showSuccess} autoHideDuration={5000} onClose={handleCloseToast}>
                <Alert onClose={handleCloseToast} severity="success" variant="filled" sx={{ width: "100%" }}>
                    Solution submitted successful
                </Alert>
            </Snackbar>
            <Snackbar open={showFailure} autoHideDuration={5000} onClose={handleCloseToast}>
                <Alert onClose={handleCloseToast} severity="error" variant="filled" sx={{ width: "100%" }}>
                    Something went wrong :(
                </Alert>
            </Snackbar>
            <Modal open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
                <Box sx={style}>
                    {loading ? <Loader /> : null}
                    <p>
                        Copy and paste your solution in the textarea below. All solutions are anonymous. If you want to update your
                        solution, submit again.
                    </p>
                    <form onSubmit={onSubmit}>
                        <TextField
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            label="Your Solution"
                            placeholder="Copy and paste your solution here"
                            fullWidth
                            multiline
                            rows={getRows()}
                        />
                        <Button variant="contained" type="submit">
                            Submit
                        </Button>
                    </form>
                </Box>
            </Modal>
        </>
    );
};

const Main = () => {
    const [search, setSearch] = useState("");
    const { filterTags, filterComplexities, onTagClick, onDifficultyClick } = useFilters();

    const filteredEntries = entries.filter((entry) => {
        const includeTags = filterTags.filter((tag) => tag.selected);

        if (includeTags.some((tag) => !entry.tags.some((entryTag) => entryTag === tag.value))) {
            return false;
        }

        const includeDifficulties = filterComplexities.filter((complexity) => complexity.selected);

        if (includeDifficulties.length && includeDifficulties.some((complexity) => Number(complexity.value) !== entry.complexity)) {
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
                    {filterTags.map((chip) => (
                        <Chip
                            key={chip.displayWithCount}
                            label={chip.displayWithCount}
                            variant={chip.selected ? "filled" : "outlined"}
                            onClick={onTagClick(chip.value)}
                        />
                    ))}
                </div>
                <div className="chips">
                    {filterComplexities.map((chip) => (
                        <Chip
                            key={chip.displayWithCount}
                            label={chip.displayWithCount}
                            variant={chip.selected ? "filled" : "outlined"}
                            onClick={onDifficultyClick(chip.value)}
                        />
                    ))}
                </div>
                <div></div>
            </form>

            <div>Search Results: {filteredEntries.length}</div>

            {filteredEntries.map((entry) => (
                <Exercise key={entry.exercise} entry={entry} />
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
