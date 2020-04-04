const playername = "ptilopsis";
const id1 = "char_171_bldsk_witch#1";
const id2 = "build_char_128_plosis"
var lastFrameTime = Date.now() / 1000;
var canvas = document.querySelector("canvas");
canvas.width = 300;
canvas.height = 300;
var config = { alpha: true };
var gl = canvas.getContext("webgl", config) || canvas.getContext("experimental-webgl", config);
if (!gl) {
	alert('WebGL is unavailable.');
}
var shader = spine.webgl.Shader.newTwoColoredTextured(gl);
var batcher = new spine.webgl.PolygonBatcher(gl);
var mvp = new spine.webgl.Matrix4();
mvp.ortho2d(0, 0, canvas.width - 1, canvas.height - 1);
var skeletonRenderer = new spine.webgl.SkeletonRenderer(gl);
var shapes = new spine.webgl.ShapeRenderer(gl);
var state, skeleton, bounds;
var assetManager = new spine.webgl.AssetManager(gl);
assetManager.loadText(id2 + ".atlas");
assetManager.loadTexture(id2 + ".png");
var skin = "default";
fetch(id2 + ".skel").then(res => res.arrayBuffer()).then(res => skel2Json(res)).then(loadskel);
async function loadskel(skeljson) {
	while (!assetManager.isLoadingComplete()) {
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	document.querySelector("textarea").value = JSON.stringify(skeljson);
	var atlas = new spine.TextureAtlas(assetManager.get(id2 + ".atlas"), path => this.assetManager.get(path));
	atlasLoader = new spine.AtlasAttachmentLoader(atlas);
	var skeletonJson = new spine.SkeletonJson(atlasLoader);
	var skeletonData = skeletonJson.readSkeletonData(skeljson);
	skeleton = new spine.Skeleton(skeletonData);
	console.log(skeleton.data.version);
	skeleton.setSkinByName('default');
	bounds = calculateBounds(skeleton);
	console.log(bounds);
	var animationStateData = new spine.AnimationStateData(skeleton.data);
	var animationState = new spine.AnimationState(animationStateData);
	animationState.setAnimation(0, "Interact", true);
	state = animationState;
	requestAnimationFrame(render);
}
function render() {
	var now = Date.now() / 1000;
	var delta = now - lastFrameTime;
	delta = 0.016;
	lastFrameTime = now;

	// Update the MVP matrix to adjust for canvas size changes
	resize();

	gl.clearColor(0.3, 0.3, 0.3, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Apply the animation state based on the delta time.
	var premultipliedAlpha = skeleton.premultipliedAlpha;
	state.update(delta);
	state.apply(skeleton);
	skeleton.updateWorldTransform();

	// Bind the shader and set the texture and model-view-projection matrix.
	shader.bind();
	shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
	shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, mvp.values);

	// Start the batch and tell the SkeletonRenderer to render the active skeleton.
	batcher.begin(shader);

	skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
	skeletonRenderer.draw(batcher, skeleton);
	batcher.end();
	shader.unbind();
	requestAnimationFrame(render);
}

function calculateBounds(skeleton) {
	skeleton.setToSetupPose();
	skeleton.updateWorldTransform();
	var offset = new spine.Vector2();
	var size = new spine.Vector2();
	skeleton.getBounds(offset, size, []);
	return { offset: offset, size: size };
}
function resize() {
	var w = canvas.clientWidth;
	var h = canvas.clientHeight;
	if (canvas.width != w || canvas.height != h) {
		canvas.width = w;
		canvas.height = h;
	}

	// magic
	var centerX = bounds.offset.x + bounds.size.x / 2;
	var centerY = bounds.offset.y + bounds.size.y / 2;
	var scaleX = bounds.size.x / canvas.width;
	var scaleY = bounds.size.y / canvas.height;
	var scale = Math.max(scaleX, scaleY) * 1.2;
	if (scale < 1) scale = 1;
	var width = canvas.width * scale;
	var height = canvas.height * scale;

	mvp.ortho2d(centerX - width / 2, centerY - height / 2, width, height);
	gl.viewport(0, 0, canvas.width, canvas.height);
}