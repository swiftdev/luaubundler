const fs = require('fs');
const path = require('path');
const process = require('process')
const { parse } = require(`luauparse`);
const formatter  = require('luauformatter');

const REPO = `https://github.com/swiftdev/luaubundler`;
const VERSION = `v1.0.9`

//                 -- return (__modules[module] and (function () __cache[module] = __modules[module](); return __cache[module] end) ()) or (function () if __debug then error("Missing module " .. module) end end)()
class Bundler {
    static req = `
        local __modules = {}; 
        local __cache   = {};
        local __require = setmetatable({}, {
            __call = function (this, module) 
                if __cache[module] ~= nil then 
                    return __cache[module]
                end 

                local mod = __modules[module];
                if not mod then
                    if __debug then
                        error("Missing module " .. module)                 
                    end 

                    return nil; 
                end 

                __cache[module] = true; 
                local res = mod();
                __cache[module] = res 

                return res; 
            end 
        });
    `;

    static modules = new Map();
    static visited = new Set(); 
    static alts    = [ // if user is setting variable to require e.g: local a = require; 
        'require'
    ]

    constructor (fp, root=false, args, name, dir=null) { this.path = path.resolve(fp); this.root = root; this.args = args; this.requires = []; this.debug = args.includes("-d"); this.start = null; this.type = args.includes('-m') ? `Minify` : `Beautify`; this.rs = {'lua': [], 'luau': []}; this.name = name; this.dir = dir || path.dirname(this.path) }

    output(message) {
        if(this.args.includes('-d'))
            console.log(message)
    }
    
    static clean(raw) {
        return raw.replace(/[^a-zA-Z0-9/.@]/g, '')
    }

    resolve(dir, fp) {
        let file = fp; 

        if(file.startsWith('@'))  {
            if (file.startsWith('@self')) {
                let split = this.path.split('\\')
                const dir = split.slice(0, split.length - 1).join('\\')

                // slice(5) == @self/
                file = dir + file.slice(5)
            } else 
                file = file.slice(1)
        }

        const paths = [
            file, 
            `${file}.lua`,
            `${file}.luau`,
            `${file}/init.lua`,
            `${file}/init.luau`
        ]

        for(const _path of paths) {
            if(fs.existsSync(path.resolve(dir, _path)) && fs.statSync(path.resolve(dir, _path)).isFile()) 
                return {
                    resolved: path.resolve(dir, _path),
                    req: fp 
                }
        }
        
        if(file.startsWith(`.`)) {
            let split = this.path.split('\\')
            let depth = 0; 
            let i = 0; 
            while(file[i] === '.') {
                depth += 1 
                ++i 
            }

            try { 
                const dir = split.slice(0, split.length - depth).join('\\')
                const nfile = file.slice(depth, file.length).slice(1) // slice(1) to remove / after all the .. 

                const paths = [
                    nfile, 
                    `${nfile}.lua`,
                    `${nfile}.luau`,
                    `${nfile}/init.lua`,
                    `${nfile}/init.luau`
                ]

                for (const _path of paths) {
                    if(fs.existsSync(path.resolve(dir, _path)) && fs.statSync(path.resolve(dir, _path)).isFile()) 
                        return { 
                            resolved: path.resolve(dir, _path),
                            req: dir.split('\\')[dir.split('\\').length - 1] + '/' + nfile
                        }
                }
            } catch (error) {
                console.error(error)
                console.error(`error resolving path: ${file} with dir: ${dir}`)
            }
        }

        console.error(`error resolving path: ${file} with dir: ${dir}`)
    }

    rewrite(node) {
        switch(node.type) {
            case "CallExpression":
                const args = node.arguments.map(this.rewrite).join(", ")
                return `${rewrite(node.base)}(${args})`
            case "StringLiteral":
                return `"${node.value}"`
            case "Identifier": 
                return node.name
        }
    }

    async collect(ast) {
        const _requires = this.requires; 
        const _rs = this.rs; 
        const _clean = Bundler.clean; 

        function walk(node) {
            if(!node || typeof node !== 'object') 
                return console.error(`missing node or node is not an object!`)

            if(node.type === 'CallExpression' && node.base.type === "Identifier" && node.base.name === "require" && node.arguments[0] && node.arguments[0].raw) {
                const value = Bundler.clean(node.arguments[0].raw); 
                _requires.push(value.replaceAll(`\\`, '/').replace(/\.(lua|luau)$/g, ''))

                // node.base.name = '__require'

                const argument = node.arguments[0];
                if(argument.type === 'StringLiteral') {
                    const raw = _clean(argument.raw);

                    if (raw.endsWith('.lua') && !_rs['lua'].includes(raw)) 
                        _rs['lua'].push(raw)

                    if (raw.endsWith('.luau') && !_rs['luau'].includes(raw))
                        _rs['luau'].push(raw)
                }
            }

            if (typeof node === 'object') {
                for(const key of Object.keys(node)) {
                    const value = node[key];

                    if (value) {
                        if(Array.isArray(value)) 
                            value.forEach(walk)
                         else if (typeof value === 'object')
                            walk(value)
                    }
                }
            }
        }

        walk(ast)
    }

    async bundle () {
        if(Bundler.visited.has(this.path)) 
            return; 

        this.output("CURRENT FILE: " + this.path)

        if(!fs.statSync(this.path).isFile()) {
            this.path.endsWith('/') ? this.path = this.path.slice(0, this.path.length - 1) : null 
            if (fs.existsSync(`${this.path}/init.lua`))
                this.path += `/init.lua`
            else if (fs.existsSync(`${this.path}/init.luau`))
                this.path += `/init.luau`
            else 
                return;
        } 

        this.start = Date.now();
        
        Bundler.visited.add(this.path);

        let code = fs.readFileSync(this.path, 'utf-8')
        const ast = parse(code, { luaVersion: 'Luau' })

        await this.collect(ast); 

        code = code.replace(/\brequire\s*\(/g, "__require(");

        if(this.rs['lua'].length > 0 || this.rs['luau'].length > 0) {
            for(const r in this.rs['lua']) {
                const raw = this.rs['lua'][r]

                code = code.replaceAll(raw, raw.replace('.lua', ''))
            }

            for(const r in this.rs['luau']) {
                const raw = this.rs['luau'][r]
                
                code = code.replaceAll(raw, raw.replace('.luau', ''))
            }
        }
        // code = this.rewrite(code)

        // Bundler.modules.set(module, code);
        // const base = path.dirname(this.path);
        
        for(const current of this.requires) {
            // const mod = req.startsWith('@') ? req.slice(1) : req 
            const { resolved, req } = this.resolve(this.dir, current);
            code = code.replaceAll(current, req)

            if(!resolved)
                console.error(`failed to resolve ${req}`)

            await (new Bundler(resolved, false, this.args, {old: current, new: req}, this.dir)).bundle()
        }

        Bundler.modules.set(this.name.new, code);

        if(this.root)
            return this.final()
    }

    final() {
        const ms = (Date.now() - this.start).toFixed(2);

        let output = `
            local __debug   = ${this.debug ? `true` : `false`}\n
        `
        output += Bundler.req; 

        for (const [name, src] of Bundler.modules.entries()) {
            output += `
            __modules["${name}"] = function ()
                ${src}
            end\n
            `
        }

        output += `__require("${this.name.new}")\n`
        
        fs.writeFileSync(`./output.luau`, output, 'utf-8')

        output = formatter[this.type](output, {
            RenameVariables: this.args.includes("-v"), 
            RenameGlobals: this.args.includes("-g"), 
            SolveMath: false, 
            Indentation: '\t'
        })


        const date = new Date();
        const compilation = `${date.getDate()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`
        output = `--[[\n\tBundled using Luaubundler ${VERSION}\n\tGithub repo: ${REPO}\n\tDiscord: https://discord.gg/2aNwJ66MVE\n\tBuild date: ${compilation}\n\tTime taken: ${ms}ms\n--]]\n${output}`
        // fs.writeFileSync(`./output.lua`, output, 'utf-8');
        return output 
    }
}

module.exports = Bundler;