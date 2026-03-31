# Luaubundler | v1.1.6
Thank you all for using this package, if you have any suggestions or errors, [Click this](https://discord.gg/2aNwJ66MVE) to contact me through the discord server.

### Command line arguments
```
"-i" the path of the input file 
"-o" the path of the directoy where the output file will be placed
"-n" the name of the output file                  | default: "output.luau"
"-d" if present, debug will be set to true        | default: false
"-m" if present, output will be minified          | default: false
"-v" if present, variables will be renamed        | default: false 
"-g" if present, global variables will be renamed | default: false
```

## Changelog
### Added 
```
[+] - Added new macro: 
    [+] - LBN_METADATA - View macros.md or the gitbook for information 
[+] - Added support for absolute path in require
```

### Updated 
```
[*] - Updated the gitbook 
[*] - Updated macros information 
```

### Fixes
```
[=] - Fixed key is not defined error
[=] - Fixed backslash being escaped in strings
[=] - Fixed `tables` within a table not having a comma after
[=] - Rewrote json-related logic 
```

## Documentation
You can view the gitbook documentation website by [Clicking this](https://luaubundler.gitbook.io/luaubundler-docs/)

## Contact 
Discord: **@swi.ft**
Support: **https://discord.gg/2aNwJ66MVE**
Github: **github.com/swiftdev**

## Credits
Luamin: **https://github.com/herrtt/luamin.js**
LuaParse: **https://github.com/fstirlitz/luaparse**

## License
Shield: [![CC BY-NC-ND 4.0][cc-by-nc-nd-shield]][cc-by-nc-nd]

This work is licensed under a
[Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License][cc-by-nc-nd].

[![CC BY-NC-ND 4.0][cc-by-nc-nd-image]][cc-by-nc-nd]

Additional clarification: This work may not be sold, sublicensed, included in paid products, or redistributed as part of a commercial package or asset bundle, whether modified or unmodified.

[cc-by-nc-nd]: https://creativecommons.org/licenses/by-nc-nd/4.0/
[cc-by-nc-nd-image]: https://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png
[cc-by-nc-nd-shield]: https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg
