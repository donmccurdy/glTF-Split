# glTF-Transform

[![Latest NPM release](https://img.shields.io/npm/v/@gltf-transform/core.svg)](https://www.npmjs.com/package/@gltf-transform/core)
[![Minzipped size](https://badgen.net/bundlephobia/minzip/@gltf-transform/core)](https://bundlephobia.com/result?p=@gltf-transform/core)
[![License](https://img.shields.io/badge/license-MIT-007ec6.svg)](https://github.com/donmccurdy/glTF-Transform/blob/master/LICENSE)

*glTF 2.0 SDK for JavaScript, TypeScript, and Node.js.*

## Introduction

<!-- NOTICE: This section is duplicated in README.md. Please keep them in sync. -->

glTF-Transform supports reading, editing, and writing 3D models in glTF 2.0 format. Unlike 3D modeling tools — which are ideal for artistic changes to geometry, materials, and animation — glTF-Transform provides fast, reproducible, and lossless control of the low-level details in 3D model. The API automatically manages array indices and byte offsets, which would otherwise require careful management when editing files. These traits make it a good choice for bundling, splitting, or optimizing an existing model. It can also be used to apply quick fixes for common issues, to build a model procedurally, or to easily develop custom extensions on top of the glTF format. Because the core SDK is compatible with both Node.js and Web, glTF-Transform may be used to develop offline workflows and web applications alike.

glTF-Transform is modular, and can be used in several ways:

- `@gltf-transform/core`: Core SDK, providing an expressive API to read, edit, and write glTF files.
- `@gltf-transform/cli`: Command-line interface to apply any available transform to a glTF file.
- `@gltf-transform/*`: Collection of [transforms](/scripting.html#transforms), written using the core API, that modify glTF files.

## Getting started

To learn how glTF-Transform works, or for an introduction to the glTF format, see [Concepts](/concepts.html). To get started, see [Installation](/scripting.html#installation) or [Scripting & CLI](/scripting.html#scripting). If you're interested in contributing to or customizing the project, see [Contributing](/contributing.html).

## Limitations

glTF-Transform supports the complete glTF 2.0 core format. However, support for extensions is currently missing. Most official Khronos Group extensions (those prefixed with `KHR_`) will be implemented on a rolling basis — pull requests are very welcome. Multi-vendor extensions (prefixed with `EXT_`) may be included on a case-by-case basis. Single-vendor extensions (any other prefix) are unlikely to be included directly in the project, although glTF-Transform does aim to enable you to effectively build and maintain implementations for those extensions externally. For any proposals, including questions or possible pull requests, please first review the [Contributing guidelines](/contributing.html).

**Supported extensions:**

None

## Alternatives and related projects

Several existing projects provide complementary functionality to that of glTF-Transform:

- [glTF-Pipeline](https://github.com/AnalyticalGraphicsInc/gltf-pipeline/), by AGI, can pack and unpack variations of the glTF format (which glTF-Transform also does) and can apply Draco compression to mesh geometry (which glTF-Transform currently does not, in order to remain portable across both Node.js and Web). While glTF-Pipeline also offers APIs to develop custom pipelines, those APIs are currently less expressive than glTF-Transform's. Because glTF-Pipeline is nearly lossless, it is a good option for applying Draco compression to models produced by glTF-Tranform. glTF-Pipeline does not run in web browsers.
- [meshoptimizer / gltfpack](https://github.com/zeux/meshoptimizer), by [@zeux](https://github.com/zeux), is an excellent tool for optimizing glTF files, and offers far better performance tuning than anything I'll ever write. It is not, however, a general-purpose SDK, and is best used for final optimizations to models produced by glTF-Transform and other tools. gltfpack does not run in web browsers.
- [Gestaltor](https://gestaltor.io/), by UX3D, is the only visual editor dedicated to inspection and editing of glTF files. If you like the 1:1 parity of glTF features that glTF-Transform provides, but need a visual editor, Gestaltor is a good choice.
- [cgltf](https://github.com/jkuhlmann/cgltf), by [@jkuhlmann](https://github.com/jkuhlmann), and [glTF-Toolkit](https://github.com/Microsoft/glTF-Toolkit), by Microsoft, provide native SDKs for glTF. If JavaScript/TypeScript don't fit your needs, try these.
- [Blender](https://www.blender.org/) offers a Python API in addition to its better-known UI. I rely on Blender for many projects, although I've only occasionally worked with its Python API.
