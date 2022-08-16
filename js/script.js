var areas = [];
var polygons = [];
var ggd_feature = data.GGD_feature;
var sgg_features = ggd_feature.SGG_features;
var emd_features;

// 시군구 이름으로 읍면동 emd_features 생성
function getEmdFeatures(sgg_nm) {
  const find_sgg_feature = sgg_features.find(
    (feature) => feature.name === sgg_nm
  );

  return find_sgg_feature.EMD_features;
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
  makeArea(ggd_feature);
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
  let feature;
  reset();

  // if (feature_NM === gyeonggi.DO_NM) {
  if (type === "DO") {
    for (const ssg of sgg_features) {
      makeArea(ssg);
    }
    moveCenter(ggd_feature.center, 10);
  } else if (type === "SGG") {
    const find_sgg_feature = sgg_features.find(
      (feature) => feature.name === feature_NM
    );
    makeArea(find_sgg_feature);
    moveCenter(find_sgg_feature.center, 8);

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
    const li_emd_ele = li_emd_eles[i];

    let a_ele = document.createElement("a");
    a_ele.innerHTML = emd_nm;
    a_ele.setAttribute("href", `javascript:makePolygon('EMD', '${emd_nm}')`);

    li_emd_ele.appendChild(a_ele);
  }
}

function resetEMDList() {
  const li_eles = document.getElementsByClassName("li-emd");
  for (const li_ele of li_eles) {
    const a_ele = li_ele.getElementsByTagName("a")[0];
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
