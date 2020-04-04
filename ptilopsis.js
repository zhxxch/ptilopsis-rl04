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
renderer = new spine.webgl.SceneRenderer(canvas, gl);
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
	var atlas = new spine.TextureAtlas(assetManager.get(id2 + ".atlas"), path => this.assetManager.get(path));
	atlasLoader = new spine.AtlasAttachmentLoader(atlas);
	var skeletonJson = new spine.SkeletonJson(atlasLoader);
	var skeletonData = skeletonJson.readSkeletonData(skeljson);
	skeleton = new spine.Skeleton(skeletonData);
	skeleton.setSkinByName('default');
	bounds = calculateBounds(skeleton);
	renderer.camera.position.x = bounds.offset.x+bounds.size.x/2;
	renderer.camera.position.y = bounds.offset.y+bounds.size.y/2;
	renderer.camera.viewportWidth = bounds.size.x * 1.2;
	renderer.camera.viewportHeight = bounds.size.y * 1.2;
	renderer.resize(spine.webgl.ResizeMode.Fit);
	var animationStateData = new spine.AnimationStateData(skeleton.data);
	var animationState = new spine.AnimationState(animationStateData);
	animationState.setAnimation(0, "Move", true);
	state = animationState;
	requestAnimationFrame(render);
}
function render() {
	var now = Date.now() / 1000;
	var delta = now - lastFrameTime;
	delta = 0.016;
	lastFrameTime = now;

	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Apply the animation state based on the delta time.
	state.update(delta);
	state.apply(skeleton);
	skeleton.updateWorldTransform();

	renderer.begin();
	renderer.drawSkeleton(skeleton, true);
	renderer.end();
	requestAnimationFrame(render);
}
document.querySelector("#flipp").addEventListener("click",flip);
function flip(){
	skeleton.flipX = !skeleton.flipX;
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