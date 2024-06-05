let video, bodypose, pose, keypoint, detector;
let poses = [];
let t = 0; // 全域變數，用來追蹤插值的進度
let GIFImg;

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
  let cam = get();
  translate(cam.width, 0);
  scale(-1, 1);
  image(cam, 0, 0);

  // 更新插值因子
  t += 0.2;
  if (t > 1) t = 0; // 重設 t 以循環動畫
}

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
      text("412737206楊雅涵", partA.x - width , partA.y - 150);
      pop();
    }
    // 眼睛
    let leftEye = pose.keypoints[1];
    let rightEye = pose.keypoints[2];
    if (leftEye.score > 0.1 && rightEye.score > 0.1) {
      push();
      imageMode(CENTER);

      // 插值計算位置
      let newX = lerp(leftEye.x, rightEye.x, t);
      let newY = lerp(leftEye.y, rightEye.y, t);

      image(GIF1Img, newX, newY, 50, 50);

      pop();
    }
    // 手肘
    let leftElbow = pose.keypoints[7];
    let rightElbow = pose.keypoints[8];
    if (leftElbow.score > 0.1 && rightElbow.score > 0.1) {
      push();
      imageMode(CENTER);

      // 插值計算位置
      let newX = lerp(leftElbow.x, rightElbow.x, t);
      let newY = lerp(leftElbow.y, rightElbow.y, t);

      image(GIF2Img, newX, newY, 50, 50);

      pop();
    }
  }
}

function preload() {
  GIF1Img = loadImage("car.gif");
  GIF2Img = loadImage("cat.gif");
}
