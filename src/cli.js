#!/usr/bin/env node

const fs  = require('fs');
const path  = require('path');
const Bundler = require('./bundler');
const process  = require('process');

(async () => {
    const args = process.argv;

    function arg(name) {
        const i = args.indexOf(name);

        if (i === -1) 
            return null;

        if (!args[i + 1])
            return null;

        return args[i + 1];
    }

    const nArg = arg("-n") || "output.luau";
    const iArg = arg("-i");
    const oArg = arg("-o");

    if (!iArg) {
        console.error(`missing input file.`)
        process.exit(-1)
    }
    
    const input = path.resolve(iArg);

    if(!fs.existsSync(iArg) || !fs.statSync(iArg).isFile()) {
        return console.error(`invalid input directory.`)
    }

    if (!oArg) {
        return console.error(`missing output file.`)
        process.exit(-1)
    }
    
    const output = path.resolve(oArg);
    
    if(!fs.existsSync(oArg)) {
        console.error(`invalid output directory.`)
        process.exit(-1)
    }

    const outfile = path.resolve(output, nArg);

    try {
        let name; 
        (() => {
            if (iArg.includes('/')) {
                const split = iArg.split('/');
                name = split[split.length - 1]
            } else if (iArg.includes('\\')) {
                const split = iArg.split('\\');
                name = split[split.length - 1]
            } else
                name = iArg
            

            name = name.replace(/\.(lua|luau)$/g, '')
        })()

        const bundler = new Bundler(input, true, args, {old: name, new: name}, path.dirname(input));
        const res     = await bundler.bundle();

        // console.log(res);
        // fs.renameSync("output.lua", outfile);
        fs.writeFileSync(path.resolve(oArg + `\\${nArg}`), res, 'utf-8')

        console.log(`successfully bundled @ ${outfile}`)
    } catch (error) {
        console.error(error)
    }
})()