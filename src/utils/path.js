const path = require('path');
const fs   = require('fs');
class PathUtil {
    constructor (Path, Directory) {
        this.path = Path; 
        this.dir  = Directory;
    }

    static Clean(raw) {
        return raw.replace(/[^a-zA-Z0-9/.@\\]/g, '')
    }

    static Name(raw) {
        return raw.replaceAll(`\\`, '/').replace(/\.(lua|luau)$/g, '')
    }

    Resolve(directory, filepath, IsDir = false) {
        if (filepath.startsWith('@')) {
            if (filepath.startsWith('@self'))
                filepath = path.join(path.dirname(this.path), filepath.slice(5))
            else
                filepath = filepath.slice(1)
        } else if (filepath.startsWith('.')) {
            const resolved = path.resolve(path.dirname(this.path), filepath);
    
            const entries = [
                resolved,
                `${resolved}.lua`,
                `${resolved}.luau`,
                path.join(resolved, 'init.luau'),
                path.join(resolved, 'init.lua')
            ]
    
            if (IsDir) {
                if (fs.existsSync(resolved)) {
                    const bool = fs.statSync(resolved).isDirectory()

                    if(bool)
                        return {
                            Resolved: resolved,
                            Directory: bool,
                            Name: PathUtil.Name(PathUtil.Clean(path.relative(this.dir, resolved)))
                        }
                }
            } else {
                for (const entry of entries) {
                    if (fs.existsSync(entry))
                        return {
                            Resolved: entry,
                            Directory: fs.statSync(entry).isDirectory(),
                            Name: PathUtil.Name(PathUtil.Clean(path.relative(this.dir, entry)))
                        }
                }
            }
        }
    
        const entries = [
            filepath, 
            `${filepath}.lua`,
            `${filepath}.luau`,
            `${filepath}/init.luau`,
            `${filepath}/init.lua`
        ]
    
        if (IsDir) {
            const resolved = path.resolve(this.dir, filepath);
    
            if (fs.existsSync(resolved)) {
                const bool = fs.statSync(resolved).isDirectory()

                if(bool)
                    return {
                        Resolved: resolved,
                        Directory: bool,
                        Name: filepath
                    };
            }
        }
    
        for (const entry of entries) {
            const resolved = path.resolve(directory, entry);
    
            if (fs.existsSync(resolved))
                return {
                    Resolved: resolved,
                    Directory: fs.statSync(resolved).isDirectory(),
                    Name: filepath
                };
        }

        if(fs.existsSync(directory))
            return {
                Resolved: directory,
                Directory: fs.statSync(directory).isDirectory(),
                Name: PathUtil.Name(PathUtil.Clean(path.relative(this.dir, directory)))
            }
    }
}

module.exports = PathUtil;