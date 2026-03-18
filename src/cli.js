#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Bundler = require('./bundler');
const minimist = require('minimist');

(async () => {
    const args = minimist(process.argv.slice(2), {
        string: ['i', 'o', 'n'],
        alias: { i: 'input', o: 'output', n: 'name' },
        default: { n: 'output.luau' }
    });

    let input = args.i;
    let output = args.o;
    let outname = args.n;

    if (!input) {
        console.error('Error: missing input file (-i)');
        process.exit(1);
    }

    if (!fs.existsSync(input) || !fs.statSync(input).isFile()) {
        console.error('Error: invalid input file');
        process.exit(1);
    }

    if (!output) {
        console.error('Error: missing output directory (-o)');
        process.exit(1);
    }

    if (!fs.existsSync(output) || !fs.statSync(output).isDirectory()) {
        console.error('Error: output directory does not exist');
        process.exit(1);
    }

    input  = path.resolve(input);
    output = path.join(path.resolve(output), outname);

    try {
        const baseName = path.basename(input, path.extname(input));
        const bundler = new Bundler(
            input,
            true,
            process.argv,
            { old: baseName, new: baseName },
            path.dirname(input)
        );

        const res = await bundler.Bundle();
        fs.writeFileSync(output, res, 'utf-8');
        console.log(`Successfully bundled to ${output}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();