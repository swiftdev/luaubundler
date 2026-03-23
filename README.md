# Luaubundler | v1.1.5
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
[+] - Nothing
```

### Fixes
```
[=] - Fixed code remaining on the same line of the debug guard e.g when you add `;` to the end of the function call 
[=] - Fixed modules being included while being in a non-debug mode while requiring a module within a debug guard 
[=] - Removed the dotenv tip 
[=] - Removed code being output (this was for debugging)
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
Shield: [![CC BY 4.0][cc-by-shield]][cc-by]

This work is licensed under a
[Creative Commons Attribution 4.0 International License][cc-by].

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: http://creativecommons.org/licenses/by/4.0/
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png
[cc-by-shield]: https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg