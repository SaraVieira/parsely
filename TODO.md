# Parsley - Implementation Progress

## Enhancements

### Graph UX

### Two-way binding (graph <-> JSON)

- [x] Edit keys + bulk rename - double-click a key to rename it, choose "This" or "All" to rename one or all matching keys

### Editor features

- [x] Add tree view for JSON input - collapsible tree structure for easier navigation of large JSON
- [x] Add code snippets for common transformations (e.g., filter, map, groupBy) in the transform editor
- [x] Allow choosing the parent for the table view when transforming arrays of objects (Source dropdown)

### Output formats

### Sharing

## Testing

- [x] Tested with empty structures (empty object, empty array, null, empty string, zero, false)
- [x] Tested with deeply nested JSON (4 levels deep)
- [x] Tested with large array with nested arrays (tags)
- [x] Tested with primitive root value (bare string)
- [x] Tested transform execution (lodash filter)
- [x] Tested revert functionality
- [x] Tested dark/light theme toggle
- [x] Tested tab switching (JSON Input, Transform, Graph, Text, Types)
- [x] Tested file up to 5mb
