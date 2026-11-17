---
category: Forms
keywords: [combobox, autocomplete, typeahead, searchable select, filter select, autosuggest]
---
# Combobox

A combobox is a field that filters a list as you type and takes one of its options.

## Use
```tsx
<Field label="City">
  <Combobox placeholder="Find a city" value={city} onChange={setCity}
    emptyText="No city by that name. Check the spelling." options={[
      { value: 'kyiv', label: 'Kyiv' },
      { value: 'lviv', label: 'Lviv' },
    ]} />
</Field>

<Combobox icon="user" aria-label="Assign to" options={[{ value: 'oksana', label: 'Oksana Franko', description: 'Farm manager' }]} />
```

## Behaviour
Typing narrows the list to the options that contain the text, and the first match is highlighted. Focus stays in the field: down and up move the highlight, Enter takes it, Escape closes the list. Taking an option writes its label into the field and calls `onChange(value)`. `onQueryChange` hears the text as it is typed, to fetch options from elsewhere.

Inside a Field it takes the label, the hint and the error by itself. `description` gives an option a second line, for names that repeat or need a role beside them.

## You provide
The options, and the sentence shown when nothing matches. Say what to do next: "No city by that name. Check the spelling."

## Do and don't
- Do use it when the list is longer than a screen: cities, countries, people.
- Do show a second line when names repeat.
- Don't use it for five options; a Select or a Radio Group is faster.
