const { parse } = require(`luauparse`);
const path      = require('path')
class ASTUtil {
    constructor (Bundler, BM) { this.bundler = Bundler; this.BM = BM };

    Rewrite(node) {
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

    static Clean(raw) {
        return raw.replace(/[^a-zA-Z0-9/.@\\]/g, '')
    }

    static Name(raw) {
        return raw.replaceAll(`\\`, '/').replace(/\.(lua|luau)$/g, '')
    }

    Walk(node, action=true, dependencies=[]) {
        if(!node || typeof node !== 'object')
            return console.error(`missing node or node is not an object!`)

        
        if(action === false) {
            if(node.type === "CallExpression" && node.base.type === "Identifier" && node.base.name === "require" && node.arguments[0] && node.arguments[0].raw) {
                const value = ASTUtil.Clean(node.arguments[0].raw); 
                dependencies.push(value)
            }

            if (typeof node === 'object') {
                for(const key of Object.keys(node)) {
                    const value = node[key];
    
                    if (value) {
                        if(Array.isArray(value)) 
                            value.forEach(v => this.Walk(v, false, dependencies))
                         else if (typeof value === 'object')
                            this.Walk(value, false, dependencies)
                    }
                }
            }

            return dependencies;
        }

        if(node.type === "CallExpression" && node.base.type === "Identifier") {
            if(node.base.name === "require") {
                if(node.arguments[0] && node.arguments[0].raw) {
                    const value = ASTUtil.Clean(node.arguments[0].raw); 
                    this.bundler.reqs.push(ASTUtil.Name(value))

                    const argument = node.arguments[0];
                    if(argument.type === 'StringLiteral') {
                        const raw = ASTUtil.Clean(argument.raw);

                        if (raw.endsWith('.lua') && !this.bundler.rs['lua'].includes(raw)) 
                            this.bundler.rs['lua'].push(raw)

                        if (raw.endsWith('.luau') && !this.bundler.rs['luau'].includes(raw))
                            this.bundler.rs['luau'].push(raw)
                    }
                }
            } else if (this.BM.macros.comptime.includes(node.base.name)) {
                return this.bundler.HandleMacro(node); 
            } else if (this.BM.macros.postcomp.includes(node.base.name)) {
                let mod = this.BM.modules.get(this.bundler.name.new); 
                if(!mod) {
                    this.BM.modules.set(this.bundler.name.new, { "src": "", "dependencies": [], "postmacros": [], "path": this.bundler.path.path})
                    mod = this.BM.modules.get(this.bundler.name.new); 
                }

                return mod.postmacros.push(node)
            }
        } else if(node.type === "Identifier" && this.BM.macros.comptime.includes(node.name))
            return this.bundler.HandleMacro(node);

        if (typeof node === 'object') {
            for(const key of Object.keys(node)) {
                const value = node[key];

                if (value) {
                    if(Array.isArray(value)) 
                        value.forEach(v => this.Walk(v))
                     else if (typeof value === 'object')
                        this.Walk(value)
                }
            }
        }
    }

    Parse(code) {
        return parse(code, { 
            luaVersion: 'Luau'
        })
    }
}

module.exports = ASTUtil;