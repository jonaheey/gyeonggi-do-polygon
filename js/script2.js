var areas = [];
var polygons = [];
var do_features = data.DO_features;
var sig_features = do_features.SIG_features;
var gu_features;
var emd_features;

// 시군 이름으로 구, 읍면동 features 생성
function getGuFeatures(sig_nm) {
  const find_sig_feature = sig_features.find((feature) => feature.name === sig_nm);
  if (find_sig_feature.GU_exist) {
    gu_features = find_sig_feature.GU_features;
  }
}

function getEmdFeatures(sig_nm) {
  const find_sig_feature = sig_features.find((feature) => feature.name === sig_nm);
  if (find_sig_feature.GU_exist) {
    // gu_features = find_sig_feature.GU_features;
  } else {
    emd_features = find_sig_feature.EMD_features;
  }
  return find_sig_feature.EMD_features;
}

// 지도 생성
var mapContainer = document.getElementById("map"), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(37.567167, 127.190292), // 지도의 중심좌표
    level: 10, // 지도의 확대 레벨
  };
var map = new kakao.maps.Map(mapContainer, mapOption);

// 다각형을 생상하고 이벤트를 등록하는 함수입니다
function displayArea(area) {
  // 다각형을 생성합니다
  var polygon = new kakao.maps.Polygon({
    map: map, // 다각형을 표시할 지도 객체
    path: area.path,
    strokeWeight: 2,
    strokeColor: "#004c80",
    strokeOpacity: 0.8,
    fillColor: "#fff",
    fillOpacity: 0.7,
  });
  polygons.push(polygon);

  // 다각형에 click 이벤트를 등록하고 이벤트가 발생하면 다각형의 이름과 면적을 인포윈도우에 표시합니다
  kakao.maps.event.addListener(polygon, "click", function (mouseEvent) {
    console.log("center :", map.getCenter());
    console.log("area.name :", area.name);
  });
}

// 지도 위에 Polygon 그리기
function displayPolygon() {
  for (var i = 0, len = areas.length; i < len; i++) {
    displayArea(areas[i]);
  }
}

// 초기화면
function init() {
  for (const sig_feature of sig_features) {
    makeArea(sig_feature);
  }
  displayPolygon();
}
init();

// 시군구 Area 만들기
function makeArea(feature) {
  const name = feature.name;
  const type = feature.geometry.type;
  const coordinates = feature.geometry.coordinates;

  if (type == "Polygon") {
    let path = [];
    for (const coordinate of coordinates) {
      for (const coord of coordinate) {
        lat = coord[1];
        lng = coord[0];
        path.push(new kakao.maps.LatLng(lat, lng));
      }
    }
    areas.push({
      name: name,
      path: path,
    });
  } else if (type == "MultiPolygon") {
    for (const coordinate of coordinates) {
      let path = [];
      for (const coord of coordinate) {
        for (const c of coord) {
          lat = c[1];
          lng = c[0];
          path.push(new kakao.maps.LatLng(lat, lng));
        }
      }
      areas.push({
        name: name,
        path: path,
      });
    }
  } else {
    console.log(`[error] ${feature}'s type : ${type}`);
  }
}

// 경기도
function makePolygon(type, feature_NM) {
  reset();

  if (type === "DO") {
    makeArea(do_features);
    moveCenter(do_features.center, do_features.zoom_level);
  } else if (type === "SIG") {
    const find_sig_feature = sig_features.find((feature) => feature.name === feature_NM);
    makeArea(find_sig_feature);
    moveCenter(find_sig_feature.center, find_sig_feature.zoom_level);

    // 읍면동 리스트 dsiplay
    emd_features = getEmdFeatures(feature_NM);
    resetEMDList();
    displayEMDList();
  } else if (type === "EMD") {
    const find_emd_feature = emd_features.find(
      (feature) => feature.name === feature_NM
    );
    makeArea(find_emd_feature);
    moveCenter(find_emd_feature.center, 6);
  } else {
    console.log(feature_NM, " is not regist on json.");
  }
  displayPolygon();
}

// 중심 좌표 이동
function moveCenter(center, zoom_level) {
  var moveLatLon = new kakao.maps.LatLng(center[1], center[0]);
  map.setLevel(zoom_level);
  map.panTo(moveLatLon);
}

// 읍면동 리스트 보여주기
function displayEMDList() {
  const li_emd_eles = document.getElementsByClassName("li-emd");
  for (let i = 0; i < emd_features.length; i++) {
    const emd_nm = emd_features[i].name;
    const li_emd = li_emd_eles[i];

    let a_ele = document.createElement("a");
    a_ele.innerHTML = emd_nm;
    a_ele.setAttribute("href", `javascript:makePolygon('EMD', '${emd_nm}')`);

    li_emd.appendChild(a_ele);
  }
}

function resetEMDList() {
  const li_emd_eles = document.getElementsByClassName("li-emd");
  for (const li_emd of li_emd_eles) {
    const a_ele = li_emd.getElementsByTagName("a")[0];
    if (a_ele != undefined) {
      a_ele.remove();
    } else {
      break;
    }
  }
}

// areas, polygons, list 리셋
function reset() {
  areas = [];
  for (const polygon of polygons) {
    polygon.setMap(null);
  }
  polygons = [];
}

// 이벤트
const ul_sgg = document.getElementById("ul-sgg");
const ul_emd = document.getElementById("ul-emd");

function mouseover(e) {
  if (e.target.tagName === 'A') {
    e.target.style.color = "#c000ff";
  }
}

function mouseout(e) {
  if (e.target.tagName === 'A') {
    e.target.style.color = "#888";
  }
}

function click(e) {
  if (e.target.tagName === 'A') {
    e.target.style.color = "#c000ff";
  }
}

ul_sgg.addEventListener("mouseover", mouseover);
ul_sgg.addEventListener("mouseout", mouseout);
ul_sgg.addEventListener("click", click);

ul_emd.addEventListener("mouseover", mouseover);
ul_emd.addEventListener("mouseout", mouseout);
ul_emd.addEventListener("click", click);