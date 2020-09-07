require('source-map-support').install();

const fs = require('fs');
const path = require('path');
const test = require('tape');
const { Document, NodeIO } = require('@gltf-transform/core');
const { MaterialsUnlit, Unlit } = require('../');

const WRITER_OPTIONS = {basename: 'extensionTest'};

test('@gltf-transform/extensions::materials-unlit', t => {
	const doc = new Document();
	const unlitExtension = doc.createExtension(MaterialsUnlit);
	const unlit = unlitExtension.createUnlit();

	const mat = doc.createMaterial('MyUnlitMaterial')
		.setBaseColorFactor([1.0, 0.5, 0.5, 1.0])
		.setRoughnessFactor(1.0)
		.setMetallicFactor(0.0)
		.setExtension('KHR_materials_unlit', unlit);

	t.equal(mat.getExtension('KHR_materials_unlit'), unlit, 'unlit is attached');

	const jsonDoc = new NodeIO(fs, path).writeJSON(doc, WRITER_OPTIONS);
	const materialDef = jsonDoc.json.materials[0];

	t.deepEqual(materialDef.pbrMetallicRoughness.baseColorFactor, [1.0, 0.5, 0.5, 1.0], 'writes base color');
	t.deepEqual(materialDef.extensions, {KHR_materials_unlit: {}}, 'writes unlit extension');
	t.deepEqual(jsonDoc.json.extensionsUsed, [MaterialsUnlit.EXTENSION_NAME], 'writes extensionsUsed');

	unlitExtension.dispose();

	t.equal(mat.getExtension('KHR_materials_unlit'), null, 'unlit is detached');
	t.end();
});

test('@gltf-transform/extensions::materials-unlit | copy', t => {
	const doc = new Document();
	const unlitExtension = doc.createExtension(MaterialsUnlit);
	doc.createMaterial()
		.setExtension('KHR_materials_unlit', unlitExtension.createUnlit());

	const doc2 = doc.clone();
	t.equals(doc2.getRoot().listExtensionsUsed().length, 1, 'copy MaterialsUnlit');
	t.ok(doc2.getRoot().listMaterials()[0].getExtension('KHR_materials_unlit'), 'copy Unlit');
	t.end();
});
