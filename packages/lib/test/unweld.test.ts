require('source-map-support').install();

import * as test from 'tape';
import { Accessor, Document, GLTF } from '@gltf-transform/core';
import { unweld } from '../';

test('@gltf-transform/lib::unweld', async t => {
	const doc = new Document();
	const positionArray = new Float32Array([
		0, 0, 0,
		0, 0, 1,
		0, 0, -1,
		0, 1, 0,
		0, -1, 0,
		1, 0, 0,
		-1, 0, 0,
	]);
	const position = doc.createAccessor()
		.setType(Accessor.Type.VEC3)
		.setArray(positionArray);
	const indices1 = doc.createAccessor()
		.setArray(new Uint32Array([
			0, 3, 5,
			0, 3, 6,
		]));
	const indices2 = doc.createAccessor()
		.setArray(new Uint32Array([
			0, 3, 5,
			1, 4, 5,
		]));
	const prim1 = doc.createPrimitive()
		.setIndices(indices1)
		.setAttribute('POSITION', position)
		.setMode(GLTF.MeshPrimitiveMode.TRIANGLES);
	const prim2 = doc.createPrimitive()
		.setIndices(indices2)
		.setAttribute('POSITION', position)
		.setMode(GLTF.MeshPrimitiveMode.TRIANGLES);
	const prim3 = doc.createPrimitive()
		.setAttribute('POSITION', position)
		.setMode(GLTF.MeshPrimitiveMode.TRIANGLE_FAN);
	doc.createMesh()
		.addPrimitive(prim1)
		.addPrimitive(prim2)
		.addPrimitive(prim3);

	await doc.transform(unweld());

	t.equals(prim1.getIndices(), null, 'no index on prim1');
	t.equals(prim2.getIndices(), null, 'no index on prim2');
	t.equals(prim3.getIndices(), null, 'no index on prim3');

	t.deepEquals(
		prim1.getAttribute('POSITION').getArray(),
		new Float32Array([
			0, 0, 0,
			0, 1, 0,
			1, 0, 0,
			0, 0, 0,
			0, 1, 0,
			-1, 0, 0,
		]),
		'subset of vertices in prim1'
	);
	t.deepEquals(
		prim2.getAttribute('POSITION').getArray(),
		new Float32Array([
			0, 0, 0,
			0, 1, 0,
			1, 0, 0,
			0, 0, 1,
			0, -1, 0,
			1, 0, 0,
		]),
		'subset of vertices in prim2'
	);
	t.deepEquals(
		prim3.getAttribute('POSITION').getArray(),
		positionArray,
		'original vertices in prim3'
	);
	t.end();
});
