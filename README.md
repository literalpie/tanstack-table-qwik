# tanstack-table-qwik

[Edit on StackBlitz ⚡️](https://stackblitz.com/edit/tanstack-table-qwik)

See [this discussion](https://github.com/BuilderIO/qwik/discussions/1918) for some background on the steps I took to get to this state.

## Known issues/TODO (PRs welcome!)

- Data is only set in the initial settings. Ideally, you'd be able to change the data at any time (really, ideally, you'd be able to change any setting, but the table settings include functions and Qwik's serialization limitations make it difficult to pass an object around that includes functions)
- Ugly UI - no indicator of sort direction, incorrect mouse hover state for clickable headers, etc.
- Virtual Scrolling - My original goal was a virtual scrolling table to <i>really</i> test the limits of Qwik, but getting the initial table to work took so much workarounds, I'm not super motivated to keep going with more complexity 😅
- Publish?! The qwik-table folder is intended to be analogous to the @tanstack/react-table library. If we ever get it to a point where it's closer to the real Tanstack table libraries, I could publish it.
