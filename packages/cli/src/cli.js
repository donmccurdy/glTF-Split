#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const gl = require('gl');
const { gzip } = require('node-gzip');
const { program } = require('@caporal/core');
const { version } = require('../package.json');
const { NodeIO } = require('@gltf-transform/core');
const { MaterialsUnlit, Unlit, KHRONOS_EXTENSIONS } = require('@gltf-transform/extensions');
const { ao } = require('@gltf-transform/ao');
const { colorspace } = require('@gltf-transform/colorspace');
const { split } = require('@gltf-transform/split');
const { prune } = require('@gltf-transform/prune');

const { inspect } = require('./inspect');
const { validate } = require('./validate');
const { formatBytes } = require('./util');
const { toktx, Mode, TOKTX_DEFAULTS } = require('./toktx');

const io = new NodeIO(fs, path).registerExtensions(KHRONOS_EXTENSIONS);


program
	.version(version)
	.description('Commandline interface for the glTF-Transform SDK.');

/**********************************************************************************************
 * GENERAL
 */

// INSPECT
program
	.command('inspect', '🔎 Inspect the contents of the model')
	.help('Inspect the contents of the model.')
	.argument('<input>', 'Path to glTF 2.0 (.glb, .gltf) model')
	.action(({args, logger}) => {
		const doc = io.read(args.input).setLogger(logger);
		inspect(doc);
	});

// VALIDATE
program
	.command('validate', '🔎 Validate the model against the glTF spec')
	.help('Validate the model with official glTF validator.')
	.argument('<input>', 'Path to glTF 2.0 (.glb, .gltf) model')
	.option('--limit <limit>', 'Limit number of issues to display', {
		validator: program.NUMERIC,
		default: Infinity,
	})
	.option('--ignore <CODE>,<CODE>,...', 'Issue codes to be ignored', {
		validator: program.ARRAY,
		default: Infinity,
	})
	.action(({args, options, logger}) => {
		validate(args.input, options, logger);
	});

// REPACK
program
	.command('copy', '📦 Copies the model with minimal changes')
	.help('Copies the model with minimal changes.')
	.argument('<input>', 'Path to glTF 2.0 (.glb, .gltf) model')
	.argument('<output>', 'Path to write output')
	.action(({args, logger}) => {
		const doc = io.read(args.input).setLogger(logger);
		io.write(args.output, doc);
	});

// PARTITION
program
	.command('partition', '📦 Partitions mesh data into separate .bin files')
	.help('Partitions mesh data into separate .bin files.')
	.argument('<input>', 'Path to read glTF 2.0 (.glb, .gltf) input')
	.argument('<output>', 'Path to write output')
	.option('--meshes <meshes>', 'Mesh names', {
		validator: program.LIST,
		required: true,
	})
	.action(({args, options, logger}) => {
		const doc = io.read(args.input)
			.setLogger(logger)
			.transform(split(options));
		io.write(args.output, doc);
	});

/**********************************************************************************************
 * MODIFY
 */

// AMBIENT OCCLUSION
program
	.command('ao', '✨ Bakes per-vertex ambient occlusion')
	.help('Bakes per-vertex ambient occlusion.')
	.argument('<input>', 'Path to read glTF 2.0 (.glb, .gltf) input')
	.argument('<output>', 'Path to write output')
	.option('--resolution <n>', 'AO resolution', {
		validator: program.NUMERIC,
		default: 512,
	})
	.option('--samples <n>', 'Number of samples', {
		validator: program.NUMERIC,
		default: 500,
	})
	.action(({args, options, logger}) => {
		const doc = io.read(args.input)
			.setLogger(logger)
			.transform(ao({...options, gl}));
		io.write(args.output, doc);
	});

// COLORSPACE
program
	.command('colorspace', '✨ Colorspace correction for vertex colors')
	.help('Colorspace correction for vertex colors.')
	.hide()
	.argument('<input>', 'Path to read glTF 2.0 (.glb, .gltf) input')
	.argument('<output>', 'Path to write output')
	.option('--inputEncoding [inputEncoding]', 'Input encoding for existing vertex colors', {
		validator: ['linear', 'sRGB'],
		required: true,
	})
	.action(({args, options, logger}) => {
		const doc = io.read(args.input)
			.setLogger(logger)
			.transform(colorspace(options));
		io.write(args.output, doc);
	});

// UNLIT
program
	.command('unlit', '✨ Converts materials to an unlit model')
	.help('Converts materials to an unlit, shadeless model.')
	.argument('<input>', 'Path to read glTF 2.0 (.glb, .gltf) input')
	.argument('<output>', 'Path to write output')
	.action(({args, logger}) => {
		const doc = io.read(args.input).setLogger(logger);

		const unlitExtension = doc.createExtension(MaterialsUnlit);
		const unlit = unlitExtension.createUnlit();
		doc.getRoot().listMaterials().forEach((material) => {
			material.setExtension(Unlit, unlit);
		});

		io.write(args.output, doc);
	});

/**********************************************************************************************
 * OPTIMIZE
 */

// PRUNE
program
	.command('dedup', '⏩ Deduplicates accessors and textures')
	.help('Deduplicates accessors and textures.')
	.argument('<input>', 'Path to read glTF 2.0 (.glb, .gltf) input')
	.argument('<output>', 'Path to write output')
	.option('--accessors <accessors>', 'Remove duplicate accessors', {
		validator: program.BOOL,
		default: true,
	})
	.option('--textures <textures>', 'Remove duplicate textures', {
		validator: program.BOOL,
		default: true,
	})
	.action(({args, options, logger}) => {
		const doc = io.read(args.input)
			.setLogger(logger)
			.transform(prune(options));
		io.write(args.output, doc);
	});

// GZIP
program
	.command('gzip', '⏩ Compress .gltf/.glb/.bin with gzip')
	.help('Compress .gltf/.glb/.bin with gzip.')
	.argument('<input>', 'Path to glTF 2.0 (.glb, .gltf) model')
	.action(({args, logger}) => {
		const inBuffer = fs.readFileSync(args.input);
		return gzip(inBuffer)
			.then((outBuffer) => {
				const fileName = args.input + '.gz';
				const inSize = formatBytes(inBuffer.byteLength);
				const outSize = formatBytes(outBuffer.byteLength);
				fs.writeFileSync(fileName, outBuffer);
				logger.info(`Created ${fileName} (${inSize} → ${outSize})`);
			});
	});

// KTX
program
	.command('ktx', '⏩ Compress textures with KTX + Basis Universal')
	.argument('<input>', 'Path to read glTF 2.0 (.glb, .gltf) input')
	.argument('<output>', 'Path to write output')
	.option(
		'--mode <mode>',
		'Basis Universal compression mode ["etc1s" = low quality, "uastc" = high quality]',
		{validator: [Mode.ETC1S, Mode.UASTC], default: Mode.ETC1S}
	)
	.option(
		'--quality <quality>',
		'Quality level, where higher levels mean larger files [0 – 1]',
		{validator: program.NUMERIC, default: TOKTX_DEFAULTS.quality}
	)
	.option(
		'--zstd <zstd>',
		'ZSTD compression level (UASTC only) [1 – 20, 0 = Off]',
		{validator: program.NUMERIC, default: 0}
	)
	.option(
		'--slots <slots>',
		'Texture slots to compress (glob expression)',
		{validator: program.STRING, default: '*'}
	)
	.action(({args, options, logger}) => {
		const doc = io.read(args.input)
			.setLogger(logger)
			.transform(toktx(options));
		io.write(args.output, doc);
	});

program.disableGlobalOption('--silent');
program.disableGlobalOption('--quiet');
program.disableGlobalOption('--no-color');

// Don't invoke run() in a test environment.
if (require.main === module) {
	program.run();
}

module.exports = program;
