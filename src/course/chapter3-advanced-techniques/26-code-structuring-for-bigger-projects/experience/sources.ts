export interface Source {
	name: string;
	type: string;
	path: string | string[];
}

// export interface Sources extends Array<Source> {}

const sources: Source[] = [
	{
		name: "environmentMapTexture",
		type: "cubeTexture",
		path: [
			"/textures/environmentMaps/5/px.jpg",
			"/textures/environmentMaps/5/nx.jpg",
			"/textures/environmentMaps/5/py.jpg",
			"/textures/environmentMaps/5/ny.jpg",
			"/textures/environmentMaps/5/pz.jpg",
			"/textures/environmentMaps/5/nz.jpg",
		],
	},
	{
		name: "grassColorTexture",
		type: "texture",
		path: "/textures/dirt/color.jpg",
	},
	{
		name: "grassNormalTexture",
		type: "texture",
		path: "/textures/dirt/normal.jpg",
	},
	{
		name: "foxModel",
		type: "gltfModel",
		path: "/models/Fox/glTF/Fox.gltf",
	},
];

export default sources;
