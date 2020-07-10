import { Extension, ExtensionConstructor } from './extension';
import { Accessor, Animation, AnimationChannel, AnimationSampler, Buffer, Camera, Material, Mesh, Node, Primitive, PrimitiveTarget, Property, PropertyGraph, Root, Scene, Skin, Texture } from './properties';
import { Logger } from './utils';

export type Transform = (doc: Document) => void;

/**
 * # Document
 *
 * *Wraps a glTF asset and its resources for easier modification.*
 *
 * Documents manage glTF assets and the relationships among dependencies. The document wrapper
 * allow tools to read and write changes without dealing with array indices or byte offsets, which
 * would otherwise require careful management over the course of a file modification. An internal
 * graph structure allows any property in the glTF file to maintain references to its dependencies,
 * and makes it easy to determine where a particular property dependency is being used. For
 * example, finding a list of materials that use a particular texture is as simple as calling
 * {@link Texture.listParents}().
 *
 * A new resource {@link Property} (e.g. a {@link Mesh} or {@link Material}) is created by calling
 * 'create' methods on the document. Resources are destroyed by calling {@link Property.dispose}().
 *
 * ```ts
 * import { Document } from '@gltf-transform/core';
 *
 * const doc = new Document();
 *
 * const texture1 = doc.createTexture('myTexture')
 * 	.setImage(arrayBuffer)
 * 	.setMimeType('image/png');
 * const texture2 = doc.createTexture('myTexture2')
 * 	.setImage(arrayBuffer)
 * 	.setMimeType('image/png');
 *
 * // Document containing duplicate copies of the same texture.
 * doc.getRoot().listTextures(); // → [texture x 2]
 *
 * doc.transform(
 * 	prune({textures: true}),
 * 	// ...
 * );
 *
 * // Document with duplicate textures removed.
 * doc.getRoot().listTextures(); // → [texture x 1]
 * ```
 *
 * Reference:
 * - [glTF → Basics](https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#gltf-basics)
 * - [glTF → Concepts](https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#concepts)
 *
 * @category Documents
 */
export class Document {
	private graph: PropertyGraph = new PropertyGraph();
	private root: Root = new Root(this.graph);
	private logger = new Logger(Logger.Verbosity.INFO);

	/** Returns the glTF {@link Root} property. */
	public getRoot(): Root {
		return this.root;
	}

	/**
	 * Returns the {@link Graph} representing connectivity of resources within this document.
	 *
	 * @hidden
	 */
	public getGraph(): PropertyGraph {
		return this.graph;
	}

	/** Returns the {@link Logger} instance used for any operations performed on this document. */
	public getLogger(): Logger {
		return this.logger;
	}

	/**
	 * Overrides the {@link Logger} instance used for any operations performed on this document.
	 *
	 * Usage:
	 *
	 * ```ts
	 * doc
	 * 	.setLogger(new Logger(Logger.Verbosity.SILENT))
	 * 	.transform(split(), ao({samples: 50}));
	 * ```
	 */
	public setLogger(logger: Logger): Document {
		this.logger = logger;
		return this;
	}

	/** Clones this Document, copying all resources within it. */
	public clone(): Document {
		return new Document().merge(this);
	}

	/** Merges the content of another Document into this one, without affecting the original. */
	public merge(other: Document): this {
		// 1. Attach extensions.
		for (const otherExtension of other.getRoot().listExtensionsUsed()) {
			const thisExtension = other.createExtension(otherExtension.constructor as ExtensionConstructor);
			if (otherExtension.isRequired()) thisExtension.setRequired(true);
		}

		// 2. Preconfigure the Root and merge history.
		const visited = new Set<Property>();
		const propertyMap = new Map<Property, Property>();
		visited.add(other.root);
		propertyMap.set(other.root, this.root);

		// 3. Create stub classes for every Property in other Document.
		for (const link of other.graph.getLinks()) {
			for (const property of [link.getParent() as Property, link.getChild() as Property]) {
				if (!visited.has(property)) {
					// TODO(bug): ExtensionProperty needs a second parameter. Need .cloneShallow()?
					const PropertyClass = property.constructor as new(g: PropertyGraph) => Property;
					propertyMap.set(property as Property, new PropertyClass(this.graph));
					visited.add(property);
				}
			}
		}

		// 4. Assemble the links between Properties.
		const resolve = (p: Property): Property => propertyMap.get(p);
		for (const otherProp of visited) {
			const thisProp = propertyMap.get(otherProp);
			thisProp.copy(otherProp, resolve);
		}

		return this;
	}

	/**
	 * Applies a series of modifications to this document. Each transformation is synchronous,
	 * takes the {@link Documen} as input, and returns nothing. Transforms are applied in the
	 * order given, which may affect the final result.
	 *
	 * Usage:
	 *
	 * ```ts
	 * doc.transform(
	 * 	ao({samples: 500}),
	 * 	prune()
	 * );
	 * ```
	 *
	 * @param transforms List of synchronous transformation functions to apply.
	 */
	public transform(...transforms: Transform[]): Document {
		for (const transform of transforms) {
			transform(this);
		}
		return this;
	}

	/**********************************************************************************************
	 * Extension factory method.
	 */

	/**
	 * Creates a new {@link Extension}, for the extension type of the given constructor. If the
	 * extension is already enabled for this Document, the previous Extension reference is reused.
	 */
	createExtension(ctor: ExtensionConstructor): Extension {
		const prevExtension = this.getRoot().listExtensionsUsed()
			.find((ext) => ext.extensionName === ctor.EXTENSION_NAME);
		return prevExtension || new ctor(this);
	}

	/**********************************************************************************************
	 * Property factory methods.
	 */

	/** Creates a new {@link Scene} attached to this document's {@link Root}. */
	createScene(name: string): Scene {
		const scene = new Scene(this.graph, name);
		this.root._addScene(scene);
		return scene;
	}

	/** Creates a new {@link Node} attached to this document's {@link Root}. */
	createNode(name: string): Node {
		const node = new Node(this.graph, name);
		this.root._addNode(node);
		return node;
	}

	/** Creates a new {@link Camera} attached to this document's {@link Root}. */
	createCamera(name: string): Camera {
		const camera = new Camera(this.graph, name);
		this.root._addCamera(camera);
		return camera;
	}

	/** Creates a new {@link Skin} attached to this document's {@link Root}. */
	createSkin(name: string): Skin {
		const skin = new Skin(this.graph, name);
		this.root._addSkin(skin);
		return skin;
	}

	/** Creates a new {@link Mesh} attached to this document's {@link Root}. */
	createMesh(name: string): Mesh {
		const mesh = new Mesh(this.graph, name);
		this.root._addMesh(mesh);
		return mesh;
	}

	/**
	 * Creates a new {@link Primitive}. Primitives must be attached to a {@link Mesh}
	 * for use and export; they are not otherwise associated with a {@link Root}.
	 */
	createPrimitive(): Primitive {
		return new Primitive(this.graph);
	}

	/**
	 * Creates a new {@link PrimitiveTarget}, or morph target. Targets must be attached to a
	 * {@link Primitive} for use and export; they are not otherwise associated with a {@link Root}.
	 */
	createPrimitiveTarget(name: string): PrimitiveTarget {
		return new PrimitiveTarget(this.graph, name);
	}

	/** Creates a new {@link Material} attached to this document's {@link Root}. */
	createMaterial(name: string): Material {
		const material = new Material(this.graph, name);
		this.root._addMaterial(material);
		return material;
	}

	/** Creates a new {@link Texture} attached to this document's {@link Root}. */
	createTexture(name: string): Texture {
		const texture = new Texture(this.graph, name);
		this.root._addTexture(texture);
		return texture;
	}

	/** Creates a new {@link Animation} attached to this document's {@link Root}. */
	createAnimation(name: string): Animation {
		const animation = new Animation(this.graph, name);
		this.root._addAnimation(animation);
		return animation;
	}

	/**
	 * Creates a new {@link AnimationChannel}. Channels must be attached to an {@link Animation}
	 * for use and export; they are not otherwise associated with a {@link Root}.
	 */
	createAnimationChannel(): AnimationChannel {
		return new AnimationChannel(this.graph);
	}

	/**
	 * Creates a new {@link AnimationSampler}. Samplers must be attached to an {@link Animation}
	 * for use and export; they are not otherwise associated with a {@link Root}.
	 */
	createAnimationSampler(): AnimationSampler {
		return new AnimationSampler(this.graph);
	}

	/** Creates a new {@link Accessor} attached to this document's {@link Root}. */
	createAccessor(name: string, buffer: Buffer = null): Accessor {
		if (!buffer) {
			buffer = this.getRoot().listBuffers()[0];
		}
		const accessor = new Accessor(this.graph, name).setBuffer(buffer);
		this.root._addAccessor(accessor);
		return accessor;
	}

	/** Creates a new {@link Buffer} attached to this document's {@link Root}. */
	createBuffer(name: string): Buffer {
		const buffer = new Buffer(this.graph, name);
		this.root._addBuffer(buffer);
		return buffer;
	}
}
