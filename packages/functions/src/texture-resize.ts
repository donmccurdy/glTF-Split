import ndarray from 'ndarray';
import { lanczos2, lanczos3 } from 'ndarray-lanczos';
import { getPixels, savePixels } from 'ndarray-pixels';
import { Document, Transform, vec2 } from '@gltf-transform/core';

const NAME = 'textureResize';

/** Options for the {@link textureResize} function. */
export interface TextureResizeOptions {
	/** Output dimensions. */
	size: vec2;
	/** Resampling filter method. */
	filter?: TextureResizeFilter;
	/** Pattern identifying textures to resize, matched to name or URI. */
	pattern?: RegExp | null;
}

/** Resampling filter methods. */
export enum TextureResizeFilter {
	/** Lanczos3 (sharp) */
	LANCZOS3 = 'lanczos3',
	/** Lanczos2 (smooth) */
	LANCZOS2 = 'lanczos2',
}

export const TEXTURE_RESIZE_DEFAULTS: TextureResizeOptions = {
	size: [512, 512],
	filter: TextureResizeFilter.LANCZOS3,
	pattern: null
};

/**
 * Resize PNG or JPEG {@link Texture}s, with {@link https://en.wikipedia.org/wiki/Lanczos_algorithm Lanczos filtering}.
 */
export function textureResize(_options: TextureResizeOptions = TEXTURE_RESIZE_DEFAULTS): Transform {
	const options = {...TEXTURE_RESIZE_DEFAULTS, ..._options} as Required<TextureResizeOptions>;

	return async (doc: Document): Promise<void> => {

		const logger = doc.getLogger();

		for (const texture of doc.getRoot().listTextures()) {
			const match = !options.pattern
				|| options.pattern.test(texture.getName())
				|| options.pattern.test(texture.getURI());
			if (!match) continue;

			if (texture.getMimeType() !== 'image/png' && texture.getMimeType() !== 'image/jpeg') {
				logger.warn(`Skipping unsupported texture type, "${texture.getMimeType()}".`);
				continue;
			}

			const [w, h] = options.size;
			if (w === texture.getSize()![0] && h === texture.getSize()![1]) {
				logger.debug('Skipping texture already at target resolution.');
				continue;
			}

			const srcImage = new Uint8Array(texture.getImage() as ArrayBuffer);
			const srcPixels = await getPixels(srcImage, texture.getMimeType());
			const dstPixels = ndarray(new Uint8Array(w * h * 4), [w, h, 4]);

			logger.debug(`${NAME}: Resizing from ${srcPixels.shape} to ${dstPixels.shape}...`);
			options.filter === TextureResizeFilter.LANCZOS3
				? lanczos3(srcPixels, dstPixels)
				: lanczos2(srcPixels, dstPixels);

			texture.setImage((await savePixels(dstPixels, texture.getMimeType())).buffer);
		}

		logger.debug(`${NAME}: Complete.`);

	};

}
