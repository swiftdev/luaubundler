# Macros

Below will include information on the currently available macros of the luaubundler. For further information, please view the [Macros documentation](https://luaubundler.gitbook.io/luaubundler-docs/documentation/macros)

## Identifiers

Compile-time constants provided by bundler that expose build information and environment flags.

* `LBN_DEBUG`

  * `boolean`
  * Replaces the identifier with a `boolean` value depending on if the `-d` (debug) flag is present.

* `LBN_BUILD_DATE`

  * `string`
  * Replaces the identifier with a `string` value that contains the date of bundling.

* `LBN_MODULE_NAME`

  * `string`
  * Replaces the identifier with a `string` value that is the identifier of the module being bundled.

* `LBN_TIME`

  * `number`
  * Replaces the identifier with a `number` value that is the amount of milliseconds it took to bundle.

* `LBN_SOURCE`

  * `string`
  * Replaces the identifier with a `string` value that is the absolute file path of the module being bundled.

* `LBN_VERSION`

  * `string`
  * Replaces the identifier with a `string` value that is the version of the luaubundler used to bundle.

* `LBN_MODULE_COUNT`

  * `number`
  * Replaces the identifier with a `number` value that is the amount of modules that have been processed and bundled.

---

# Functions

Build-time functions that generate code or data during the bundling process.

### `LBN_LSDIR`

* `Return type`: **table**
* `Information`: returns an array of module names from a specified directory.
* `Parameters`

  * `Directory`

    * `type`: string
    * `Information`: the directory to read files from. Can be a module path or relative path.
  * `IncludeSubDir`

    * `type`: boolean
    * `Information`: optional parameter. If `true`, directories inside the target directory will also be included.
  * `IncludeExtension`

    * `type`: boolean
    * `Information`: optional parameter. If `true`, file extensions will be preserved in the returned names.

---

### `LBN_LOAD_JSON`

* `Return type`: **table**
* `Information`: loads a JSON file and converts it into a Luau table during bundling.
* `Parameters`

  * `Path`

    * `type`: string
    * `Information`: the relative or absolute path of the JSON file to load.

---

### `LBN_IMPORT_ALL`

* `Return type`: **table**
* `Information`: imports all Lua/Luau modules from a directory.
* `Parameters`

  * `Path`

    * `type`: string
    * `Information`: the absolute or relative path of the directory (treat it like a module).

---

### `LBN_READ_FILE`

* `Return type`: **string**
* `Information`: reads a file during bundling and embeds its contents directly into the output script as a Lua multiline string.
* `Parameters`

  * `Path`

    * `type`: string
    * `Information`: the absolute or relative path of the file to read.

Example:

Input:

```lua
local a = LBN_READ_FILE("hi.txt")
```

Output:

```lua
local a = [[
...file contents
]]
```

This is useful for embedding configuration files, text assets, or other static resources directly into the bundled output.

---

### `LBN_DEBUG_GUARD`

* `Return type`: **none**
* `Information`: marks the beginning of a debug-only code block. Any code between `LBN_DEBUG_GUARD` and `LBN_DEBUG_GUARD_END` will only be included in the output if the bundler is executed with the `-d` debug flag.

---

### `LBN_DEBUG_GUARD_END`

* `Return type`: **none**
* `Information`: marks the end of a debug-only code block started by `LBN_DEBUG_GUARD`.

Example:

Input:

```lua
LBN_DEBUG_GUARD

print("Debug information")
print("More debug logs")

LBN_DEBUG_GUARD_END
```

Output **with `-d` flag**:

```lua
print("Debug information")
print("More debug logs")
```

Output **without `-d` flag**:

```lua
-- debug code removed
```

This feature is useful for including debug logs, profiling tools, or development-only code that should not be present in production builds.

---

### `LBN_METADATA`

* `Return type`: **table**
* `Information`: retrieves metadata about a file during the bundling process and embeds it directly into the output as a Luau table.

`LBN_METADATA` is a compile-time macro that inspects a file and generates a table containing useful information such as its path, extension, size, modification time, and dependencies. The metadata is collected by the bundler using Node.js file system APIs and expanded directly into the final bundled code.

Parameters:

* `Path`

  * `type`: **string**
  * `Information`: the relative or absolute path to the file to retrieve metadata for.

Example:

Input:

```lua
local data = LBN_METADATA("./utils/print.luau")
```

During bundling, this might expand to something like:

```lua
local data = {
	['AbsolutePath'] = 'C:\\Users\\swift\\Desktop\\projects\\node.js\\luaubundler\\example\\utils\\print.luau',
	['RelativePath'] = 'utils\\print.luau',
	['FileName'] = 'print.luau',
	['Extension'] = 'luau',
	['Size'] = 120,
	['LastModified'] = 'Tue Mar 31 2026 20:59:18 GMT+0100 (British Summer Time)',
	['Dependencies'] = {
		'utils/print'
	}
}
```

Returned fields:

* `AbsolutePath`

  * The absolute path of the file on disk.

* `RelativePath`

  * The path of the file relative to the project directory.

* `FileName`

  * The name of the file including its extension.

* `Extension`

  * The file extension.

* `Size`

  * The size of the file in bytes.

* `LastModified`

  * The timestamp of the last modification of the file.

* `Dependencies`

  * An array containing module identifiers that the file depends on.

This macro is useful for build metadata generation, debugging dependency graphs, or embedding file information directly into the bundled program. Because the metadata is generated during bundling, the final script does not require any runtime file system access.

---
