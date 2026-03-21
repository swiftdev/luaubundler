const fs                = require('fs'); 
const { path, ast }     = require('./utils'); 
const formatter         = require('luauformatter')
const Path              = require('path')

require('dotenv').config({ path: `./.env` }); 
const { VERSION, REPO } = process.env;

class Bundler {
    // macro information has been moved to macros.md 
    static macros = {
        "variables": [
            "LBN_DEBUG",
            "LBN_BUILD_DATE", 
            "LBN_MODULE_NAME",
            "LBN_TIME", 
            "LBN_SOURCE", 
            "LBN_VERSION", 
            "LBN_MODULE_COUNT", 
        ], 

        "functions": [
            "LBN_LSDIR", 
            "LBN_LOAD_JSON",
            "LBN_IMPORT_ALL",
            "LBN_READ_FILE"
        ]
    }

    constructor (Path, Root=false, Args, Name, Directory=null) {
        this.path  = new path(Path, Directory);
        this.root  = Root; 
        this.args  = Args; 
        this.reqs  = []; 
        this.name  = Name; 

        this.start = null; 
        this.type  = Args.includes(`-m`) ? `Minify` : `Beautify`
        this.dir   = Directory || Path.dirname(Path);
        this.code  = null; 

        this.utils = {
            ast : new ast(this, Bundler), 
            path: this.path
        }
        this.rs = {
            'lua' : [],
            'luau': []
        }
    }

    static modules = new Map();
    static visited = new Set();

    CompMacro(src, ms, compilation, name=null) {
        function re(str) {
            return new RegExp(`\\b${str}\\b`, "g");
        }

        if(!this.args.includes('-d')) {
            let lines = src.split('\n');
            let depth   = 0; 

            const startr = /LBN_DEBUG_GUARD\s*\(\s*\)/;
            const endr   = /LBN_DEBUG_GUARD_END\s*\(\s*\)/;

            const arr = {
                ['start']: [],
                ['end']  : [] 
            }

            for(const [index, line] of lines.entries()) {
                if(line.search(startr) !== -1) {
                    ++depth 

                    arr['start'].push(index); 
                } else if (line.search(endr) !== -1) {
                    --depth

                    arr['end'].push(index)
                }
            }

            if (depth !== 0 || arr['start'].length !== arr['end'].length) {
                console.error(`[Error]: missing \`LBN_DEBUG_GUARD_END()\` or inaccuracies between the amount of guards and guard ends from ${name}`)
                return process.exit()
            }

            const zones = []; 
            for(let i = 0; i < arr['start'].length; ++i) {
                zones.push({
                    start: arr['start'][i], 
                    end  : arr['end'][arr['end'].length - 1 - i]
                })
            }

            lines = lines.filter((line, index) => {
                let bool = true; 

                for(const zone of zones) {
                    if(index >= zone.start && index <= zone.end)
                        bool = false 
                }

                return bool; 
            })

            src = lines.join('\n'); 
        } else {
            const startr = /LBN_DEBUG_GUARD\s*\(\s*\)/g;
            const endr   = /LBN_DEBUG_GUARD_END\s*\(\s*\)/g;

            src = src.replaceAll(startr, '')
            src = src.replaceAll(endr, '')
        }

        return src
        .replaceAll(re("LBN_TIME"), ms)
        .replaceAll(re("LBN_BUILD_DATE"), `'${compilation}'`)
        .replaceAll(re("LBN_MODULE_COUNT"), Bundler.modules.size)
        .replaceAll(re("LBN_DEBUG"), this.args.includes('-d') ? `true` : `false`)
    }

    static Clean(raw) {
        return raw.replace(/[^a-zA-Z0-9/.@\\]/g, '')
    }

    static Name(raw) {
        return raw.replaceAll(`\\`, '/').replace(/\.(lua|luau)$/g, '')
    }

    ConstructArray(value) {
        switch(typeof value) {
            case "number":
                return value 
            case "string":
                return `'${value}'`
            case "object": 
                if(Array.isArray(value)) {
                    const entries = Object.entries(value);

                    const data    = entries.map(([_, value]) => {
                        return this.ConstructArray(value)
                    }) 

                    return `{ ${data.join(', ')} }`; 
                } else {
                    const entries = Object.entries(value);

                    const data    = entries.map(([key, value]) => {
                        return this.ConstructJson(key, value)
                    })

                    return `['${key}'] = { ${data.join(',\n\t')} }`
                }
        }
    }

    ConstructJson(key, value) {
        switch(typeof value) {
            case "number":
                return `\n\t['${key}'] = ${value},`
            case "string":
                return `\n\t['${key}'] = '${value}',`
            case "object":
                if(Array.isArray(value)) {
                    return `['${key}'] = ${this.ConstructArray(value)}`
                } else {
                    const entries = Object.entries(value);

                    const data    = entries.map(([key, value]) => {
                        return this.ConstructJson(key, value)
                    })

                    return `['${key}'] = { ${data.join(',\n\t')} }`
                }
        }
    }

    HandleMacro(node) {
        switch(node.type) {
            case "CallExpression":
                const name = node.base.name; 

                if(name === "LBN_LSDIR") {
                    const params = node.arguments;

                    if(params.length === 0)
                        return console.error(`Error in module ${this.name}, expected params for function: LBN_LSDIR, got nothing.`)

                    const subdirs = params.length === 2 ? params[1].value : false
                    const ext     = params.length === 3 ? params[2].value : false 
                    const name    = params[0].value;
                    const raw     = params[0].raw; 

                    const { Resolved: resolved } = this.utils.path.Resolve(this.dir, name, true); 
                    if(fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
                        const files = fs.readdirSync(resolved, { withFileTypes: true })
                        .filter((file) => {
                            if (file.isDirectory())
                                return subdirs; 

                            return file.name.endsWith('.luau') || file.name.endsWith('.lua')
                        })
                        .map(file => `'${file.isDirectory() ? file.name : ext ? file.name : file.name.split(Path.dirname(file.name))[0] }'`);

                        const pattern = new RegExp(
                            `LBN_LSDIR\\s*\\(\\s*${raw}` +                              
                            `(?:\\s*,\\s*(true|false))?` +                              
                            `(?:\\s*,\\s*(true|false))?` +                              
                            `\\s*\\)`                                                   
                        );

                        this.code = this.code.replace(pattern, `{${files.join(", ")}}`)
                    }
                } else if (name === "LBN_LOAD_JSON") {
                    const params = node.arguments;

                    if(params.length === 0)
                        return console.error(`Error in module ${this.name}, expected params for function: LBN_LOAD_JSON, got nothing.`)

                    const name = params[0].value; 
                    const { Resolved: resolved } = this.utils.path.Resolve(this.dir, name, false);

                    if(fs.existsSync(resolved) && fs.statSync(resolved).isFile() && Path.extname(resolved) === '.json') {
                        const data = JSON.parse(fs.readFileSync(resolved, 'utf-8')); 
                        
                        let obj = `{`; 
                        for(const [key, value] of Object.entries(data)) {
                            obj += this.ConstructJson(key, value);
                        }
                        const pattern = new RegExp(
                            `LBN_LOAD_JSON\\s*\\(\\s*${params[0].raw}` +
                            `\\s*\\)`                                                   
                        );

                        obj += '}'

                        this.code = this.code.replace(pattern, obj)
                    }
                } else if (name === "LBN_IMPORT_ALL") {
                    const params = node.arguments; 
                    const dir    = params[0].value;

                    if(!dir)
                        return console.error(`Error in module ${this.name}, expected params for function: LBN_IMPORT_ALL, got nothing.`)

                    const { Resolved: resolved } = this.utils.path.Resolve(this.dir, dir, true);

                    if(fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
                        const modules = fs.readdirSync(resolved).filter((mod) => mod.endsWith('.lua') || mod.endsWith('.luau')); 
                        const mods    = []; 

                        let output    = `{`
                        for(const module of modules) {
                            mods.push(Bundler.Name(module));
                            const name = Bundler.Name(Path.relative(this.dir, Path.join(resolved, module))) 
                            
                            if(!this.reqs.includes(name))
                                this.reqs.push(name);

                            output += `\n\t['${Bundler.Name(module)}'] = LBN_REQUIRE('${name}'),`
                        }

                        output += '\n\t}'

                        const pattern = new RegExp(
                            `LBN_IMPORT_ALL\\s*\\(\\s*${params[0].raw}` +
                            `\\s*\\)`                                                   
                        );

                        this.code = this.code.replace(pattern, output)
                    }
                } else if (name === "LBN_READ_FILE") {
                    const params = node.arguments; 
                    const file   = params[0].value; 

                    if(!file)
                        return console.error(`Error in module ${this.name}, expected params for function: LBN_READ_FILE, got nothing.`)

                    const { Resolved: resolved } = this.utils.path.Resolve(this.dir, file, false);

                    if(fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
                        const data = fs.readFileSync(resolved, 'utf-8');

                        if(!data)
                            return console.error(`Error reading data from ${resolved}`)
                        
                        console.log(data)
                        const pattern = new RegExp(
                            `LBN_READ_FILE\\s*\\(\\s*${params[0].raw}` +
                            `\\s*\\)`                                                   
                        );

                        this.code = this.code.replace(pattern, `[[\n\t${data}\n]]`)
                    }
                }

            case "Identifier":
                switch(node.name) {
                    case "LBN_MODULE_NAME":
                        this.code = this.code.replaceAll(/\bLBN_MODULE_NAME\b/g, `'${this.name.new}'`)
                    case "LBN_SOURCE":
                        this.code = this.code.replaceAll(/\bLBN_SOURCE\b/g, `'${this.path.path.replaceAll('\\', '\\\\')}'`)
                    case "LBN_VERSION":
                        this.code = this.code.replaceAll(/\bLBN_VERSION\b/g, `'${VERSION}'`)
                }
        }
    }

    async Bundle() {
        const path = this.path.path; 
        if(Bundler.visited.has(path))
            return; 

        if(!fs.statSync(path).isFile())
            return; 

        this.start = Date.now();
        Bundler.visited.add(path)

        this.code = fs.readFileSync(path, 'utf-8')
        const ast = this.utils.ast.Parse(this.code);

        await this.utils.ast.Walk(ast);

        this.code = this.code.replace(/\brequire\s*\(/g, "LBN_REQUIRE(");
        if(this.rs['lua'].length > 0 || this.rs['luau'].length > 0) {
            for(const r in this.rs['lua']) {
                const raw = this.rs['lua'][r]

                this.code = this.code.replaceAll(raw, raw.replace('.lua', ''))
            }

            for(const r in this.rs['luau']) {
                const raw = this.rs['luau'][r]
                
                this.code = this.code.replaceAll(raw, raw.replace('.luau', ''))
            }
        }

        for(const module of this.reqs) {
            const { Resolved, Name } = this.utils.path.Resolve(this.dir, module);
            this.code = this.code.replaceAll(module, Name)

            if(!Resolved)
                return console.error(`failed to resolve ${Name}`)

            await (new Bundler(Resolved, false, this.args, {old: module, new: Name}, this.dir)).Bundle()
        }

        Bundler.modules.set(this.name.new, this.code);

        if(this.root)
            return this.Output()
    }

    Output () {
        const ms          = (Date.now() - this.start).toFixed(2);
        const date        = new Date(Date.now());
        const compilation = date.toLocaleString()

        let output = fs.readFileSync(`./src/module/code.luau`, 'utf-8'); 
        output = this.CompMacro(output, ms, compilation, this.name['new'])

        for (let [name, src] of Bundler.modules.entries()) {
            src = this.CompMacro(src, ms, compilation, name)
            output += `
            LBN_MODULES["${name}"] = function ()
                ${src}
            end\n
            `
        }

        output += `LBN_REQUIRE("${this.name.new}")`

        output = formatter[this.type](output, {
            RenameVariables: this.args.includes("-v"), 
            RenameGlobals: this.args.includes("-g"), 
            SolveMath: false, 
            Indentation: '\t'
        })

        output = `--[[\n\tBundled using Luaubundler ${VERSION}\n\tGithub repo: ${REPO}\n\tDiscord: https://discord.gg/2aNwJ66MVE\n\tBuild date: ${compilation}\n\tTime taken: ${ms}ms\n--]]\n${output}`
        return output; 
    }
}

module.exports = Bundler;