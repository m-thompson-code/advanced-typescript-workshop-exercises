import { createContext, FC, ReactNode, useContext, useMemo, useState } from "react";
import { tagCounts, complexityCounts } from "./output.json";
import { useNavigate, useSearchParams } from "react-router-dom";

interface FilterChip {
    display: string;
    displayWithCount: string;
    value: string;
    selected: boolean;
    count: number;
}

function toFilterChips<T extends Record<string, number>>(input: T): FilterChip[] {
    return Object.entries(input)
        .filter(([, count]) => !!count)
        .map(([chip, count]) => {
            const display = chip.split("-").join(" ");

            return {
                display,
                displayWithCount: `${display} (${count})`,
                value: chip,
                selected: false,
                count,
            };
        });
}

function toComplexityFilterChips<T extends Record<string, number>>(input: T): FilterChip[] {
    const chips = toFilterChips(input);
    return chips.map((chip) => ({
        ...chip,
        display: `Complexity ${chip.display}`,
        displayWithCount: `Complexity ${chip.display} (${chip.count})`,
    }));
}

interface FiltersContextType {
    filterTags: FilterChip[];
    setFilterTags: React.Dispatch<React.SetStateAction<FilterChip[]>>;
    filterComplexities: FilterChip[];
    setFilterComplexities: React.Dispatch<React.SetStateAction<FilterChip[]>>;
    onTagClick: (value: string) => () => void;
    onDifficultyClick: (value: string) => () => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export interface FiltersProviderProps {
    children?: ReactNode;
}

export const FiltersProvider: FC<FiltersProviderProps> = ({ children }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [filterTags, setFilterTags] = useState(
        toFilterChips(tagCounts).map((filter) => {
            if ((searchParams.get("filters") ?? "").split(",").includes(filter.value)) {
                return { ...filter, selected: true };
            }

            return filter;
        }),
    );
    const [filterComplexities, setFilterComplexities] = useState(toComplexityFilterChips(complexityCounts).map((filter) => {
        if ((searchParams.get("complexities") ?? "").split(",").includes(filter.value)) {
            return { ...filter, selected: true };
        }

        return filter;
    }));

    const getOnClick =
        ([filters, setFilters]: [FilterChip[], React.Dispatch<React.SetStateAction<FilterChip[]>>]) =>
        (value: string) =>
        () => {
            const updatedFilters = [...filters];
            const updatedChip = updatedFilters.find((chip) => chip.value === value);

            if (!updatedChip) {
                return;
            }

            updatedChip.selected = !updatedChip.selected;

            if (setFilters === setFilterTags) {
                searchParams.set(
                    "filters",
                    updatedFilters
                        .filter(({ selected }) => selected)
                        .map(({ value }) => value)
                        .join(","),
                );
            } else if (setFilters === setFilterComplexities) {
                searchParams.set(
                    "complexities",
                    updatedFilters
                        .filter(({ selected }) => selected)
                        .map(({ value }) => value)
                        .join(","),
                );
            }

            console.log(searchParams);

            navigate({
                pathname: location.pathname,
                search: searchParams.toString(),
            });

            setFilters(updatedFilters);
        };

    const onTagClick = getOnClick([filterTags, setFilterTags]);
    const onDifficultyClick = getOnClick([filterComplexities, setFilterComplexities]);

    const value = useMemo(() => {
        return { filterTags, setFilterTags, filterComplexities, setFilterComplexities, onTagClick, onDifficultyClick };
    }, [filterComplexities, filterTags, onDifficultyClick, onTagClick]);

    return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
};

export const useFilters = (): FiltersContextType => {
    const context = useContext(FiltersContext);

    if (!context) {
        throw new Error("useFilters must be used within a FiltersProvider");
    }

    return context;
};
