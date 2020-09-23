import { Graph } from '../graph';
import { Accessor } from './accessor';
import { ExtensionProperty } from './extension-property';
import { Material } from './material';
import { Primitive } from './primitive';
import { PrimitiveTarget } from './primitive-target';
import { AttributeLink, IndexLink, TextureLink } from './property-links';
import { Texture } from './texture';
import { TextureInfo } from './texture-info';

/** @hidden */
export class PropertyGraph extends Graph {
	public linkTexture(name: string, a: Material | ExtensionProperty, b: Texture): TextureLink {
		if (!b) return null;
		const link = new TextureLink(name, a, b)
			.setTextureInfoLink(this.link(name + 'Info', a, new TextureInfo(this)));
		this.registerLink(link);
		return link;
	}

	public linkAttribute(name: string, a: Primitive|PrimitiveTarget, b: Accessor): AttributeLink {
		if (!b) return null;
		const link = new AttributeLink(name, a, b);
		this.registerLink(link);
		return link;
	}

	public linkIndex(name: string, a: Primitive, b: Accessor): IndexLink {
		if (!b) return null;
		const link = new IndexLink(name, a, b);
		this.registerLink(link);
		return link;
	}
}
