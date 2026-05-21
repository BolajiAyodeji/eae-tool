# Energy Access Explorer Tool

This is the source code for the primary visualisation of the platform. A live
version found [here](https://www.energyaccessexplorer.org/).

[![DPG Badge](https://img.shields.io/badge/Verified-DPG-3333AB?logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMzEiIGhlaWdodD0iMzMiIHZpZXdCb3g9IjAgMCAzMSAzMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0LjIwMDggMjEuMzY3OEwxMC4xNzM2IDE4LjAxMjRMMTEuNTIxOSAxNi40MDAzTDEzLjk5MjggMTguNDU5TDE5LjYyNjkgMTIuMjExMUwyMS4xOTA5IDEzLjYxNkwxNC4yMDA4IDIxLjM2NzhaTTI0LjYyNDEgOS4zNTEyN0wyNC44MDcxIDMuMDcyOTdMMTguODgxIDUuMTg2NjJMMTUuMzMxNCAtMi4zMzA4MmUtMDVMMTEuNzgyMSA1LjE4NjYyTDUuODU2MDEgMy4wNzI5N0w2LjAzOTA2IDkuMzUxMjdMMCAxMS4xMTc3TDMuODQ1MjEgMTYuMDg5NUwwIDIxLjA2MTJMNi4wMzkwNiAyMi44Mjc3TDUuODU2MDEgMjkuMTA2TDExLjc4MjEgMjYuOTkyM0wxNS4zMzE0IDMyLjE3OUwxOC44ODEgMjYuOTkyM0wyNC44MDcxIDI5LjEwNkwyNC42MjQxIDIyLjgyNzdMMzAuNjYzMSAyMS4wNjEyTDI2LjgxNzYgMTYuMDg5NUwzMC42NjMxIDExLjExNzdMMjQuNjI0MSA5LjM1MTI3WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==)](https://digitalpublicgoods.net/r/energy-access-explorer)

## Development

Is written in plain/modern Javascript (ECMAScript 2020) for now. No framework,
instead traditional C-style programming pattern is enforced.

As usual, the directories contain
- `src`: JavaScript code
- `stylesheets`: CSS code
- `views`: HTML documents
- `bin`: scripts and executables

## Dependencies
Libraries have been chosen very strictly. The big ones are:
- [Mapbox GL JS](https://github.com/mapbox/mapbox-gl-js)
- [geotiff](https://github.com/geotiffjs/geotiff.js) for raster parsing
- [D3js](https://d3js.org) to generate interactive controls such as sliders,
  pie-charts, etc.

Other minor plugins/functions are used. See `dependencies.tsv`.

## Building & hacking

Assumptions made:

- standard Unix-like environment (cat, sed, echo, rsync, bmake...)
- Energy Access Explorer infrastructure:
  [database](https://github.com/energyaccessexplorer/database),
  [API](https://github.com/energyaccessexplorer/api) and
  [website](https://github.com/energyaccessexplorer/website)
  should be up and running.

The `makefile` (BSDmake) contains basic tasks for development/deployment. To get
started, edit the `.env` file to match your needs.

Now you can run in development mode with (`bmake` in Linux):

    $ make build start

## License

This project is licensed under MIT. Additionally, you must read the
[attribution page](https://www.energyaccessexplorer.org/attribution)
before using any part of this project.
