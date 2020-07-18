require('source-map-support').install();

const fs = require('fs');
const path = require('path');
const test = require('tape');
const { Document, NodeIO } = require('@gltf-transform/core');
const { MaterialsClearcoat, Clearcoat } = require('../');

const WRITER_OPTIONS = {basename: 'extensionTest'};

test('@gltf-transform/extensions::materials-clearcoat', t => {
	const doc = new Document();
	const clearcoatExtension = doc.createExtension(MaterialsClearcoat);
	const clearcoat = clearcoatExtension.createClearcoat()
		.setClearcoatFactor(0.9)
		.setClearcoatTexture(doc.createTexture())
		.setClearcoatRoughnessFactor(0.1);

	const mat = doc.createMaterial('MyClearcoatMaterial')
		.setBaseColorFactor([1.0, 0.5, 0.5, 1.0])
		.setExtension(Clearcoat, clearcoat);

	t.equal(mat.getExtension(Clearcoat), clearcoat, 'clearcoat is attached');

	const nativeDoc = new NodeIO(fs, path).createNativeDocument(doc, WRITER_OPTIONS);
	const materialDef = nativeDoc.json.materials[0];

	t.deepEqual(materialDef.pbrMetallicRoughness.baseColorFactor, [1.0, 0.5, 0.5, 1.0], 'writes base color');
	t.deepEqual(materialDef.extensions, {KHR_materials_clearcoat: {
		clearcoatFactor: 0.9,
		clearcoatRoughnessFactor: 0.1,
		clearcoatTexture: {index: 0, texCoord: 0},
	}}, 'writes clearcoat extension');
	t.deepEqual(nativeDoc.json.extensionsUsed, [MaterialsClearcoat.EXTENSION_NAME], 'writes extensionsUsed');

	clearcoatExtension.dispose();
	t.equal(mat.getExtension(Clearcoat), null, 'clearcoat is detached');

	const roundtripDoc = new NodeIO(fs, path)
		.registerExtensions([MaterialsClearcoat])
		.createDocument(nativeDoc);
	const roundtripMat = roundtripDoc.getRoot().listMaterials().pop();

	t.equal(roundtripMat.getExtension(Clearcoat).getClearcoatFactor(), 0.9, 'reads clearcoatFactor');
	t.equal(roundtripMat.getExtension(Clearcoat).getClearcoatRoughnessFactor(), 0.1, 'reads clearcoatFactor');
	t.ok(roundtripMat.getExtension(Clearcoat).getClearcoatTexture(), 'reads clearcoatTexture');
	t.end();
});

test('@gltf-transform/extensions::materials-clearcoat | copy', t => {
	const doc = new Document();
	const clearcoatExtension = doc.createExtension(MaterialsClearcoat);
	const clearcoat = clearcoatExtension.createClearcoat()
		.setClearcoatFactor(0.9)
		.setClearcoatRoughnessFactor(0.1)
		.setClearcoatNormalScale(0.5)
		.setClearcoatTexture(doc.createTexture('cc'))
		.setClearcoatRoughnessTexture(doc.createTexture('ccrough'))
		.setClearcoatNormalTexture(doc.createTexture('ccnormal'));
	doc.createMaterial()
		.setExtension(Clearcoat, clearcoat);

	const doc2 = doc.clone();
	const clearcoat2 = doc2.getRoot().listMaterials()[0].getExtension(Clearcoat);
	t.equals(doc2.getRoot().listExtensionsUsed().length, 1, 'copy MaterialsClearcoat');
	t.ok(clearcoat2, 'copy Clearcoat');
	t.equals(clearcoat2.getClearcoatFactor(), 0.9, 'copy clearcoatFactor');
	t.equals(clearcoat2.getClearcoatRoughnessFactor(), 0.1, 'copy clearcoatFactor');
	t.equals(clearcoat2.getClearcoatNormalScale(), 0.5, 'copy clearcoatFactor');
	t.equals(clearcoat2.getClearcoatTexture().getName(), 'cc', 'copy clearcoatTexture');
	t.equals(clearcoat2.getClearcoatRoughnessTexture().getName(), 'ccrough', 'copy clearcoatRoughnessTexture');
	t.equals(clearcoat2.getClearcoatNormalTexture().getName(), 'ccnormal', 'copy clearcoatNormalTexture');
	t.end();
});
