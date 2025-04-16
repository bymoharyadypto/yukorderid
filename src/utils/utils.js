function transformDataArray(sourceArray, mappings) {
    if (!Array.isArray(sourceArray)) return [];

    return sourceArray.map(source =>
        Object.fromEntries(
            Object.entries(mappings).map(([key, value]) => [
                key,
                typeof value === "function" ? value(source) : source[value],
            ])
        )
    );
}

module.exports = {
    transformDataArray,
};