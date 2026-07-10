const fs = require("fs");
const path = require("path");

const chunks = [];
const views = [];
const accessors = [];
const meshes = [];

function aligned(buffer) {
  const padding = (4 - (buffer.length % 4)) % 4;
  return padding ? Buffer.concat([buffer, Buffer.alloc(padding)]) : buffer;
}

function addBuffer(buffer, target) {
  const offset = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const data = aligned(buffer);
  chunks.push(data);
  views.push({ buffer: 0, byteOffset: offset, byteLength: buffer.length, target });
  return views.length - 1;
}

function addAccessor(values, type, componentType, target) {
  const array = componentType === 5126 ? new Float32Array(values) : new Uint16Array(values);
  const view = addBuffer(Buffer.from(array.buffer), target);
  const size = { SCALAR: 1, VEC2: 2, VEC3: 3 }[type];
  const count = values.length / size;
  const accessor = { bufferView: view, componentType, count, type };
  if (componentType === 5126 && type === "VEC3") {
    accessor.min = [0, 1, 2].map(axis => Math.min(...Array.from({ length: count }, (_, i) => values[i * 3 + axis])));
    accessor.max = [0, 1, 2].map(axis => Math.max(...Array.from({ length: count }, (_, i) => values[i * 3 + axis])));
  }
  accessors.push(accessor);
  return accessors.length - 1;
}

function addMesh(positions, indices, material) {
  const position = addAccessor(positions, "VEC3", 5126, 34962);
  const index = addAccessor(indices, "SCALAR", 5123, 34963);
  meshes.push({ primitives: [{ attributes: { POSITION: position }, indices: index, material }] });
  return meshes.length - 1;
}

const boxPositions = [
  -2,0,-1.25, 2,0,-1.25, 2,2.3,-1.25, -2,2.3,-1.25,
  -2,0, 1.25, 2,0, 1.25, 2,2.3, 1.25, -2,2.3, 1.25
];
const boxIndices = [0,2,1,0,3,2,4,5,6,4,6,7,0,4,7,0,7,3,1,2,6,1,6,5,3,7,6,3,6,2,0,1,5,0,5,4];

const roofPositions = [
  -2.25,2.25,-1.45, 2.25,2.25,-1.45, 0,3.65,-1.45,
  -2.25,2.25, 1.45, 2.25,2.25, 1.45, 0,3.65, 1.45
];
const roofIndices = [0,2,1,3,4,5,0,3,5,0,5,2,1,2,5,1,5,4,0,1,4,0,4,3];

const nodes = [
  { mesh: addMesh(boxPositions, boxIndices, 0), name: "Waende" },
  { mesh: addMesh(roofPositions, roofIndices, 1), name: "Dach" }
];

const binary = Buffer.concat(chunks);
const gltf = {
  asset: { version: "2.0", generator: "Jugendhaus placeholder generator" },
  scene: 0,
  scenes: [{ nodes: [0, 1] }],
  nodes,
  meshes,
  materials: [
    { name: "Wand", pbrMetallicRoughness: { baseColorFactor: [0.88,0.86,0.82,1], metallicFactor: 0, roughnessFactor: 0.9 }, doubleSided: false },
    { name: "Dach", pbrMetallicRoughness: { baseColorFactor: [0.58,0.12,0.09,1], metallicFactor: 0, roughnessFactor: 0.8 }, doubleSided: false }
  ],
  buffers: [{ byteLength: binary.length }],
  bufferViews: views,
  accessors
};

const json = aligned(Buffer.from(JSON.stringify(gltf), "utf8"));
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + json.length + 8 + binary.length, 8);
const jsonHeader = Buffer.alloc(8);
jsonHeader.writeUInt32LE(json.length, 0);
jsonHeader.writeUInt32LE(0x4e4f534a, 4);
const binHeader = Buffer.alloc(8);
binHeader.writeUInt32LE(binary.length, 0);
binHeader.writeUInt32LE(0x004e4942, 4);

const output = path.join(__dirname, "..", "models", "jugendhaus.glb");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, Buffer.concat([header, jsonHeader, json, binHeader, binary]));
console.log(output);
