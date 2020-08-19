require('source-map-support').install();

const test = require('tape');
const ndarray = require('ndarray');
const savePixels = require('save-pixels');

const { Document, BufferUtils } = require ('@gltf-transform/core');
const { PBRSpecularGlossiness, MaterialsSpecular, MaterialsPBRSpecularGlossiness, Specular, IOR, MaterialsIOR } = require ('@gltf-transform/extensions');
const { metalRough } = require('../');

const ZEROS = ndarray(new Uint8Array([
	0, 0, 0, 0,
]), [1, 1, 4]);

const DIFFUSE = ndarray(new Uint8Array([
	64, 64, 128, 1,
]), [1, 1, 4]);

const SPEC_GLOSS = ndarray(new Uint8Array([
	255, 0, 0, 0,
	0, 255, 0, 64,
	0, 0, 255, 128,
	0, 0, 0, 255
]), [1, 4, 4]);

const SPEC = ndarray(new Uint8Array([
	255, 0, 0, 255,
	0, 255, 0, 255,
	0, 0, 255, 255,
	0, 0, 0, 255
]), [1, 4, 4]);

// 1 - gloss * glossFactor
const ROUGH = ndarray(new Uint8Array([
	0, 0, 0, 0,
	0, 0, 0, 32,
	0, 0, 0, 64,
	0, 0, 0, 128
]), [1, 4, 4]);

async function ndarrayToImage (pixels) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		savePixels(pixels, 'png')
			.on('data', (d) => chunks.push(d))
			.on('end', () => resolve(BufferUtils.trim(Buffer.concat(chunks))))
			.on('error', (e) => reject(e));
	});
}

test('@gltf-transform/lib::metalRough | textures', async t => {
	const doc = new Document();
	const baseColorTex = doc.createTexture()
		.setImage(await ndarrayToImage(ZEROS))
		.setMimeType('image/png');
	const metalRoughTex = doc.createTexture()
		.setImage(await ndarrayToImage(ZEROS))
		.setMimeType('image/png');
	const diffuseTex = doc.createTexture()
		.setImage(await ndarrayToImage(DIFFUSE))
		.setMimeType('image/png');
	const specGlossTex = doc.createTexture()
		.setImage(await ndarrayToImage(SPEC_GLOSS))
		.setMimeType('image/png');
	const specGlossExtension = doc.createExtension(MaterialsPBRSpecularGlossiness);
	const specGloss = specGlossExtension.createPBRSpecularGlossiness()
		.setDiffuseTexture(diffuseTex)
		.setSpecularGlossinessTexture(specGlossTex)
		.setGlossinessFactor(0.5);
	const mat = doc.createMaterial()
		.setBaseColorTexture(baseColorTex)
		.setMetallicRoughnessTexture(metalRoughTex)
		.setExtension(PBRSpecularGlossiness, specGloss);

	await doc.transform(metalRough());

	const baseColorImage = await ndarrayToImage(DIFFUSE);
	const specImage = await ndarrayToImage(SPEC);
	const roughImage = await ndarrayToImage(ROUGH);

	t.deepEqual(
		doc.getRoot().listExtensionsUsed().map((e) => e.extensionName).sort(),
		[MaterialsIOR.EXTENSION_NAME, MaterialsSpecular.EXTENSION_NAME],
		'uses KHR_materials_ior and KHR_materials_specular'
	);
	t.ok(specGloss.isDisposed(), 'disposes PBRSpecularGlossiness');
	t.ok(baseColorTex.isDisposed(), 'disposes baseColorTexture');
	t.ok(metalRoughTex.isDisposed(), 'disposes metalRoughTexture');
	t.ok(specGlossTex.isDisposed(), 'disposes specGlossTexture');
	t.deepEqual(mat.getBaseColorTexture().getImage(), baseColorImage, 'diffuse -> baseColor');
	t.deepEqual(mat.getMetallicRoughnessTexture().getImage(), roughImage, 'spec -> rough');
	t.deepEqual(mat.getExtension(Specular).getSpecularTexture().getImage(), specImage, 'diffuse -> baseColor');
	t.equal(mat.getExtension(IOR).getIOR(), 0, 'ior = 0');
	t.equal(mat.getRoughnessFactor(), 1, 'roughnessFactor = 1');
	t.equal(mat.getMetallicFactor(), 0, 'metallicFactor = 0');
	t.equal(doc.getRoot().listTextures().length, 3, 'correct texture count');

	t.end();
});

test('@gltf-transform/lib::metalRough | factors', async t => {
	const doc = new Document();
	const specGlossExtension = doc.createExtension(MaterialsPBRSpecularGlossiness);
	const specGloss = specGlossExtension.createPBRSpecularGlossiness()
		.setDiffuseFactor([0, 1, 0, 0.5])
		.setSpecularFactor([1, 0.5, 0.5])
		.setGlossinessFactor(0.9);
	const mat = doc.createMaterial()
		.setBaseColorFactor([1, 0, 0, 1])
		.setMetallicFactor(0.25)
		.setRoughnessFactor(0.75)
		.setExtension(PBRSpecularGlossiness, specGloss);

	await doc.transform(metalRough());

	t.deepEqual(
		doc.getRoot().listExtensionsUsed().map((e) => e.extensionName).sort(),
		[MaterialsIOR.EXTENSION_NAME, MaterialsSpecular.EXTENSION_NAME],
		'uses KHR_materials_ior and KHR_materials_specular'
	);
	t.deepEqual(mat.getBaseColorFactor(), [0, 1, 0, 0.5], 'baseColorFactor = diffuseFactor');
	t.equal(mat.getExtension(Specular).getSpecularFactor(), 1, 'specularFactor = 1');
	t.deepEqual(mat.getExtension(Specular).getSpecularColorFactor(), [1, 0.5, 0.5], 'specularColorFactor = specularFactor');
	t.equal(mat.getExtension(IOR).getIOR(), 0, 'ior = 0');
	t.equal(mat.getRoughnessFactor().toFixed(3), '0.100', 'roughnessFactor = 1 - glossFactor');
	t.equal(mat.getMetallicFactor(), 0, 'metallicFactor = 0');
	t.equal(doc.getRoot().listTextures().length, 0, 'no textures');

	t.end();
});
