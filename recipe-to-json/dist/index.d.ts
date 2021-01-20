declare class Quantity {
    number: string;
    dimensions: Dimension[];
    label: string;
    constructor();
}
declare class Dimension {
    magnitude: string;
    number_of_dimensions: string;
    constructor();
}
declare class Source {
    href: string;
    text: string;
    constructor();
}
export declare class Recipe {
    title: string;
    quantity: Quantity;
    source: Source;
    ingredient_list: object[];
    method: object[];
    notes: Note[];
    serving_suggestions: ServingSuggestion[];
    variations: Variation[];
    constructor();
}
declare class ServingSuggestion {
    text: string;
    constructor(text: string);
}
declare class Variation {
    text: string;
    constructor(text: string);
}
declare class Note {
    text: string;
    constructor(text: string);
}
export declare function parseMethodSubList(line: string, recipe: Recipe): void;
export declare function returnString(line: string): string;
export declare function parseMethodStep(line: string, recipe: Recipe): void;
export {};
