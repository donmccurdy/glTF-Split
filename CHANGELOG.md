# Changelog

## v0.9 — 🚧 Unreleased

[Milestone](https://github.com/donmccurdy/glTF-Transform/milestone/9)

**Features:**

- Add 'resample' transform.
- Add `KHR_materials_volume` extension.
- Add `EXT_mesh_gpu_instancing` extension.

**Breaking changes:**

- Stricter type checking.
- Enum values moved from `GLTF.*` to static properties of the relevant class. Primitive enum values are now allowed.

## v0.8

[Milestone](https://github.com/donmccurdy/glTF-Transform/milestone/8)

**Features:**

- Add 'weld' and 'unweld' transforms.
- Add encoding/compression support for `KHR_draco_mesh_compression`.
- Add KTX and WebP support in utils and 'inspect' function.
- Add `KHR_materials_variants` extension.

**Breaking changes:**

- Stricter type checking.
- External type definitions are now installed as dependencies.

## v0.7

[Milestone](https://github.com/donmccurdy/glTF-Transform/milestone/7)

**Features:**

- Add 'center' and 'sequence' transforms.
- Add 'bounds' helper.
- Enhance 'partition' transform to support animations.
- Add `KHR_draco_mesh_compression` extension (decode only).
- Add `KHR_texture_transform` extension.
- Add `EXT_texture_webp` extension.
- Add `KHR_materials_sheen` extension.

**Breaking changes:**

- Merged TextureSampler properties into TextureInfo.
- TextureInfo now extends from ExtensibleProperty.
- Simplified I/O API. Renamed:
  - NativeDocument -> JSONDocument
  - unpackGLB -> readBinary
  - packGLB -> writeBinary
  - createDocument -> readJSON
  - createNativeDocument -> writeJSON
  - unpackGLBToNativeDocument -> binaryToJSON

## v0.6

[Milestone](https://github.com/donmccurdy/glTF-Transform/milestone/6)

**Features:**

- Add world transform API (getWorldTranslation/getWorldRotation/getWorldScale/getWorldMatrix) and getMatrix to Node.
- Add ColorUtils and helper methods to work with colors in hexadecimal and sRGB.
- Add traverse method to Node.
- Simplified Extension API.
- Add Extras API.

**CLI:**

- Accept textures in `merge` command.

**Breaking changes:**

- getExtension/setExtension syntax changed to accept extension names, not constructors. See [ExtensibleProperty](https://gltf-transform.donmccurdy.com/classes/extensibleproperty.html).
- Scene addNode/removeNode/listNodes are now addChild/removeChild/listChildren, for consistency with Node API.

## v0.5

[Milestone](https://github.com/donmccurdy/glTF-Transform/milestone/5)

## v0.4

[Milestone](https://github.com/donmccurdy/glTF-Transform/milestone/4)

## v0.2

[Milestone](https://github.com/donmccurdy/glTF-Transform/milestone/2)

## v0.1

[Milestone](https://github.com/donmccurdy/glTF-Transform/milestone/1)
