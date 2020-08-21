import { Document, Transform } from '@gltf-transform/core';

const NAME = 'sequence';

interface SequenceOptions {
	fps: number;
	pattern: RegExp;
}

const DEFAULT_OPTIONS: SequenceOptions = {
	fps: 10,
	pattern: null,
};

/**
 * Options:
 * - **fps**: Frames per second, where one node is shown each frame. Default 10.
 * - **pattern**: Pattern (regex) used to filter nodes for the sequence. Required.
 */
export function sequence (options: SequenceOptions): Transform {
	options = {...DEFAULT_OPTIONS, ...options};

	return (doc: Document): void => {

		const logger = doc.getLogger();
		const root = doc.getRoot();
		const fps = options.fps;

		// Collect sequence nodes.
		const sequenceNodes = root.listNodes()
			.filter((node) => node.getName().match(options.pattern));

		// Create animation cycling visibility of each node.
		const anim = doc.createAnimation();
		const animBuffer = root.listBuffers()[0];
		sequenceNodes.forEach((node, i) => {
			// Create keyframe tracks that show each node for a single frame.
			let inputArray;
			let outputArray;
			if (i === 0) {
				inputArray = [i / fps, (i + 1) / fps];
				outputArray = [1,1,1, 0,0,0];
			} else if (i === sequenceNodes.length - 1) {
				inputArray = [(i - 1) / fps, i / fps];
				outputArray = [0,0,0, 1,1,1];
			} else {
				inputArray = [(i - 1) / fps, i / fps, (i + 1) / fps];
				outputArray = [0,0,0, 1,1,1, 0,0,0];
			}

			// Append channel to animation sequence.
			const input = doc.createAccessor()
				.setArray(new Float32Array(inputArray))
				.setBuffer(animBuffer);
			const output = doc.createAccessor()
				.setArray(new Float32Array(outputArray))
				.setBuffer(animBuffer)
				.setType(GLTF.AccessorType.VEC3);
			const sampler = doc.createAnimationSampler()
				.setInterpolation(GLTF.AnimationSamplerInterpolation.STEP)
				.setInput(input)
				.setOutput(output);
			const channel = doc.createAnimationChannel()
				.setTargetNode(node)
				.setTargetPath(GLTF.AnimationChannelTargetPath.SCALE)
				.setSampler(sampler);
			anim.addSampler(sampler).addChannel(channel);
		});

		logger.debug(`${NAME}: Complete.`);

	};

}
