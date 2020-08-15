require('source-map-support').install();

const fs = require('fs');
const path = require('path');
const test = require('tape');
const { Document, NodeIO } = require('@gltf-transform/core');
const { MaterialsIOR, IOR } = require('../');

const WRITER_OPTIONS = {basename: 'extensionTest'};

test('@gltf-transform/extensions::materials-ior', t => {
	const doc = new Document();
	const iorExtension = doc.createExtension(MaterialsIOR);
	const ior = iorExtension.createIOR().setIOR(1.2);

	const mat = doc.createMaterial('MyMaterial')
		.setBaseColorFactor([1.0, 0.5, 0.5, 1.0])
		.setExtension(IOR, ior);

	t.equal(mat.getExtension(IOR), ior, 'ior is attached');

	const nativeDoc = new NodeIO(fs, path).createNativeDocument(doc, WRITER_OPTIONS);
	const materialDef = nativeDoc.json.materials[0];

	t.deepEqual(materialDef.pbrMetallicRoughness.baseColorFactor, [1.0, 0.5, 0.5, 1.0], 'writes base color');
	t.deepEqual(materialDef.extensions, {KHR_materials_ior: {ior: 1.2,}}, 'writes ior extension');
	t.deepEqual(nativeDoc.json.extensionsUsed, [MaterialsIOR.EXTENSION_NAME], 'writes extensionsUsed');

	iorExtension.dispose();
	t.equal(mat.getExtension(IOR), null, 'ior is detached');

	const roundtripDoc = new NodeIO(fs, path)
		.registerExtensions([MaterialsIOR])
		.createDocument(nativeDoc);
	const roundtripMat = roundtripDoc.getRoot().listMaterials().pop();

	t.equal(roundtripMat.getExtension(IOR).getIOR(), 1.2, 'reads ior');
	t.end();
});

test('@gltf-transform/extensions::materials-ior | copy', t => {
	const doc = new Document();
	const iorExtension = doc.createExtension(MaterialsIOR);
	const ior = iorExtension.createIOR()
		.setIOR(1.2);
	doc.createMaterial().setExtension(IOR, ior);

	const doc2 = doc.clone();
	const ior2 = doc2.getRoot().listMaterials()[0].getExtension(IOR);
	t.equals(doc2.getRoot().listExtensionsUsed().length, 1, 'copy MaterialsIOR');
	t.ok(ior2, 'copy IOR');
	t.equals(ior2.getIOR(), 1.2, 'copy ior');
	t.end();
});
