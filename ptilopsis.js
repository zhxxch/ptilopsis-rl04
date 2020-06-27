const playername = "ptilopsis";
const id2 = "enemy_1504_cqbw"
var lastFrameTime = Date.now() / 1000;
var canvas = document.querySelector("canvas");
canvas.width=Math.min(512,window.innerWidth);
canvas.height=Math.min(512,window.innerHeight);
var config = { alpha: true };
var gl = canvas.getContext("webgl", config) || canvas.getContext("experimental-webgl", config);
if (!gl) {
	alert('WebGL is unavailable.');
}
renderer = new spine.webgl.SceneRenderer(canvas, gl);
var skeletonRenderer = new spine.webgl.SkeletonRenderer(gl);
skeletonRenderer.premultipliedAlpha=0;
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
	renderer.camera.viewportWidth = 512*(512/bounds.size.x);
	renderer.camera.viewportHeight = 512*(512/bounds.size.y);
	renderer.resize(spine.webgl.ResizeMode.Fit);
	var animationStateData = new spine.AnimationStateData(skeleton.data);
	var animationState = new spine.AnimationState(animationStateData);
	animationState.setAnimation(0, "Die", false);
	animationState.addAnimation(0, "Default", true);
	state = animationState;
	if(Math.random()<0.5){skeleton.flipX = !skeleton.flipX;}
	var now = Date.now() / 1000;
	lastFrameTime = now;
	//requestAnimationFrame(render);
}
function render() {
	var now = Date.now() / 1000;
	var delta = now - lastFrameTime;
	//delta=0.016
	lastFrameTime = now;

	gl.clearColor(0, 0, 0, 0);
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
function render2(delta=0) {

	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Apply the animation state based on the delta time.
	state.update(delta);
	state.apply(skeleton);
	skeleton.updateWorldTransform();

	renderer.begin();
	renderer.drawSkeleton(skeleton, true);
	renderer.end();
}
function exportCanvasAsPNG(fileName) {

    var canvasElement = document.querySelector("canvas");

    var MIME_TYPE = "image/png";

    var imgURL = canvasElement.toDataURL(MIME_TYPE);

    var dlLink = document.createElement('a');
    dlLink.download = fileName;
    dlLink.href = imgURL;
    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(':');

    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
}
function run(maxframes,i){
	if(i<maxframes){
		const name = "cqbw_m_"+(("0000"+i).slice(-4));
		render2(0);
		exportCanvasAsPNG(name);
		render2(0.016);
		setTimeout(function(){run(maxframes,i+1)},500);
	}
}
var lastInteractTime = 0;
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