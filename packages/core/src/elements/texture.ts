import { Element } from "./element";
import { Link } from "../graph/index";
import { Material } from "./material";

export class Texture extends Element {
    private buffer: ArrayBuffer = null;
    private mimeType: GLTF.ImageMimeType = null;

    public getBuffer(): ArrayBuffer { return this.buffer; }
    public setBuffer(buffer: ArrayBuffer): Texture {
        this.buffer = buffer;
        return this;
    }

    public getMimeType(): GLTF.ImageMimeType { return this.mimeType; }
    public setMimeType(mimeType: GLTF.ImageMimeType): Texture {
        this.mimeType = mimeType;
        return this;
    }
}

export class TextureInfo {
    private texCoord: number = 0;
    private magFilter: GLTF.TextureMagFilter = null;
    private minFilter: GLTF.TextureMinFilter = null;
    private wrapS: GLTF.TextureWrapMode = GLTF.TextureWrapMode.REPEAT;
    private wrapT: GLTF.TextureWrapMode = GLTF.TextureWrapMode.REPEAT;

    public getTexCoord(): number { return this.texCoord; }
    public setTexCoord(texCoord: number): TextureInfo {
        this.texCoord = texCoord;
        return this;
    }

    public getMagFilter(): GLTF.TextureMagFilter { return this.magFilter; }
    public setMagFilter(magFilter: GLTF.TextureMagFilter): TextureInfo {
        this.magFilter = magFilter;
        return this;
    }

    public getMinFilter(): GLTF.TextureMinFilter { return this.minFilter; }
    public setMinFilter(minFilter: GLTF.TextureMinFilter): TextureInfo {
        this.minFilter = minFilter;
        return this;
    }

    public getWrapS(): GLTF.TextureWrapMode { return this.wrapS; }
    public setWrapS(wrapS: GLTF.TextureWrapMode): TextureInfo {
        this.wrapS = wrapS;
        return this;
    }

    public getWrapT(): GLTF.TextureWrapMode { return this.wrapT; }
    public setWrapT(wrapT: GLTF.TextureWrapMode): TextureInfo {
        this.wrapT = wrapT;
        return this;
    }
}
