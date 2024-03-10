let video;
let poseNet;
let bodyPix;
let isBodyPixActive = false;
let poses = [];

async function switchToBodyPix() {
  isBodyPixActive = !isBodyPixActive;

  const button = document.getElementById('switch');

  if (isBodyPixActive) {
    setupBodyPix();
    // BodyPix가 활성화된 경우, PoseNet의 비디오를 숨깁니다.
    if (video) {
      video.hide();
    }
    // 버튼 텍스트를 BodyPix 활성화에 맞게 변경
    button.innerText = 'Leave Moshpoint';
  } else {
    setupPoseNet();
    // PoseNet이 활성화된 경우, BodyPix의 비디오를 숨깁니다.
    if (bodyPix) {
      bodyPix.video.show(); // BodyPix의 비디오를 보여줍니다.
    }
    // 버튼 텍스트를 PoseNet 활성화에 맞게 변경
    button.innerText = 'Are You Stressed Out? JUST PAUSE!';
  }
}

function setup() {
  createCanvas(1000, 700);
  setupPoseNet(); // 초기 설정은 PoseNet으로 시작
}

function draw() {
  background(200);

  if (isBodyPixActive) {
    // BodyPix가 활성화된 경우, BodyPix 비디오를 그립니다.
    if (bodyPix) {
      image(bodyPix.backgroundMask, 0, 0, width, height);
    }
  } else {
    // BodyPix가 비활성화된 경우, PoseNet 비디오를 그립니다.
    if (video) {
      image(video, 0, 0, width, height);
    }

    // PoseNet이 인식한 포즈를 화면에 그립니다.
    drawKeypoints();
  }
}

function setupPoseNet() {
  // 이미 video가 있는 경우를 체크하고, 있다면 새로운 비디오를 생성하지 않습니다.
  if (!video) {
    // 비디오 설정
    video = createCapture(VIDEO, () => {
      console.log("Video ready");
      video.size(width, height);
      video.hide();

      // PoseNet 설정
      poseNet = ml5.poseNet(video, modelLoaded);
      poseNet.on("pose", gotPoses);
    });
  }
}

function modelLoaded() {
  console.log("PoseNet model loaded");
}

function gotPoses(results) {
  poses = results;
}

function drawKeypoints() {
  // 포즈 관련 로직을 추가합니다.
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

function setupBodyPix() {
  // 이미 bodyPix가 있는 경우를 체크하고, 있다면 새로운 bodyPix를 생성하지 않습니다.
  if (!bodyPix) {
    // BodyPix 설정
    bodyPix = ml5.bodyPix(() => {
      console.log("BodyPix model loaded");
      // BodyPix에 적용할 비디오를 설정하고 segment 메소드를 호출합니다.
      bodyPix.segment(video, gotResults);
    });
  }
}

function gotResults(error, result) {
  if (error) {
    console.error(error);
    return;
  }

  // BodyPix 비디오를 그립니다.
  image(result.backgroundMask, 0, 0, width, height);
  // BodyPix 비디오를 계속 업데이트합니다.
  bodyPix.segment(video, gotResults);
}
