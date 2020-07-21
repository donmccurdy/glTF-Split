import { PropertyType } from './constants';
import { Document } from './document';
import { ReaderContext, WriterContext } from './io';
import { ExtensionProperty, ExtensionPropertyParent } from './properties';

/**
 * Type alias allowing Extension constructors to be used as tokens for type checking.
 * @hidden
 */
export type ExtensionConstructor = {new(doc: Document): Extension; EXTENSION_NAME: string};

/**
 * # Extension
 *
 * *Base class for all Extensions.*
 *
 * Extensions enhance a glTF {@link Document} with additional features and schema, beyond the core
 * glTF specification. Common extensions may be imported from the `@gltf-transform/extensions`
 * package, or custom extensions may be created by extending this base class.
 *
 * An extension is added to a Document by calling {@link Document.createExtension} with the
 * extension constructor. The extension object may then be used to construct
 * {@link ExtensionProperty} instances, which are attached to properties throughout the Document
 * as prescribed by the extension itself.
 *
 * For more information on available extensions and their usage, see [Extensions](/extensions).
 *
 * Reference:
 * - [glTF → Extensions](https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#specifying-extensions)
 * - [glTF Extension Registry](https://github.com/KhronosGroup/glTF/blob/master/extensions)
 *
 * @category Extensions
 */
export abstract class Extension implements ExtensionPropertyParent {
	public static EXTENSION_NAME: string;
	public readonly extensionName: string;
	public readonly provideTypes: PropertyType[] = [];

	private _required = false;
	private _properties: Set<ExtensionProperty> = new Set();

	/** @hidden */
	constructor (protected readonly doc: Document) {
		doc.getRoot()._enableExtension(this);
	}

	/** Disables and removes the extension from the Document. */
	public dispose(): void {
		this.doc.getRoot()._disableExtension(this);
		for (const property of this._properties) {
			property.dispose();
		}
	}

	/**
	 * Indicates to the client whether it is OK to load the asset when this extension is not
	 * recognized. Optional extensions are generally preferred, if there is not a good reason
	 * to require a client to completely fail when an extension isn't known.
	 */
	public isRequired(): boolean {
		return this._required;
	}

	/**
	 * Indicates to the client whether it is OK to load the asset when this extension is not
	 * recognized. Optional extensions are generally preferred, if there is not a good reason
	 * to require a client to completely fail when an extension isn't known.
	 */
	public setRequired(required: boolean): this {
		this._required = required;
		return this;
	}

	/**********************************************************************************************
	 * ExtensionPropertyParent implementation.
	 */

	/** @hidden */
	public addExtensionProperty(property: ExtensionProperty): this {
		this._properties.add(property);
		return this;
	}

	/** @hidden */
	public removeExtensionProperty(property: ExtensionProperty): this {
		this._properties.delete(property);
		return this;
	}

	/**********************************************************************************************
	 * I/O implementation.
	 */

	/**
	 * Used by the {@link PlatformIO} utilities when reading a glTF asset. This method may
	 * optionally be implemented by an extension, and should then support any property type
	 * declared by the Extension's {@link PropertyType.provideTypes} list. The Extension will
	 * be given a ReaderContext instance, and is expected to update either the context or its
	 * NativeDocument with resources known to the Extension.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public provide(readerContext: ReaderContext, propertyType: PropertyType): this {
		return this;
	}

	/**
	 * Used by the {@link PlatformIO} utilities when reading a glTF asset. This method must be
	 * implemented by each extension in order to support reading files. The extension will be
	 * given a ReaderContext instance, and should update the current {@link Document} accordingly.
	 */
	public abstract read(readerContext: ReaderContext): this;

	/**
	 * Used by the {@link PlatformIO} utilities when writing a glTF asset. This method must be
	 * implemented by each extension in order to support writing files. The extension will be
	 * given a WriterContext instance, and should modify the {@link NativeDocument} output
	 * accordingly. Adding the extension name to the `extensionsUsed` and `extensionsRequired` list
	 * is done automatically, and should not be included here.
	 */
	public abstract write(writerContext: WriterContext): this;
}
