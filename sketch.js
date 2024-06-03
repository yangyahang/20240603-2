/* MoveNet Skeleton - Steve's Makerspace (most of this code is from TensorFlow)

MoveNet is developed by TensorFlow:
https://www.tensorflow.org/hub/tutorials/movenet

*/

let video, bodypose, pose, keypoint, detector;
let poses = [];

async function init() {
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
  };
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
  );
}

async function videoReady() {
  console.log("video ready");
  await getPoses();
}

async function getPoses() {
  if (detector) {
    poses = await detector.estimatePoses(video.elt, {
      maxPoses: 2,
      //flipHorizontal: true,
    });
  }
  requestAnimationFrame(getPoses);
}

async function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, videoReady);
  video.size(width, height);
  video.hide();
  await init();

  stroke(255);
  strokeWeight(5);
}

function draw() {
  image(video, 0, 0);
  drawSkeleton();
  // flip horizontal
  cam = get();
  translate(cam.width, 0);
  scale(-1, 1);
  image(cam, 0, 0);
}

let t = 0; // 全域變數，用來追蹤插值的進度

function drawSkeleton() {
  // 繪製所有追蹤到的關鍵點
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    // 文字
    let partA = pose.keypoints[0];
    if (partA.score > 0.1) {
      push();
      textSize(20);
      scale(-1, 1);
      text("412737206楊雅涵", partA.x - width - 100, partA.y - 150);
      pop();
    }
    // 眼睛
    partA = pose.keypoints[1];
    let partB = pose.keypoints[2];
    if (partA.score > 0.1 && partB.score > 0.1) {
      push();
      imageMode(CENTER);
      
      // 插值計算位置
      let newX = lerp(partA.x, partB.x, t);
      let newY = lerp(partA.y, partB.y, t);
      
      image(GIFImg, newX, newY, 50, 50);

      // 更新插值因子
      t += 0.01;
      if (t > 1) t = 0; // 重設 t 以循環動畫

      pop();
    }
    // 手肘
    partA = pose.keypoints[7];
    partB = pose.keypoints[8];
    if (partA.score > 0.1 && partB.score > 0.1) {
      push();
      imageMode(CENTER);
      image(GIFImg, partA.x, partA.y, 50, 50);
      image(GIFImg, partB.x, partB.y, 50, 50);
      pop();
    }
  }
}
function preload(){
	GIFImg = loadImage("car.gif");
}


/* Points (view on left of screen = left part - when mirrored)
  0 nose
  1 left eye
  2 right eye
  3 left ear
  4 right ear
  5 left shoulder
  6 right shoulder
  7 left elbow
  8 right elbow
  9 left wrist
  10 right wrist
  11 left hip
  12 right hip
  13 left kneee
  14 right knee
  15 left foot
  16 right foot
*/
