import { useRef, useImperativeHandle, useState, useEffect, forwardRef } from "react";
import axios from "axios";
import * as THREE from "three";
import FileSaver from "file-saver";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import Github from "../../assets/github.svg";
import Typeface from "../../assets/typeface.json";

const fontLoader = new FontLoader();

type SkylineProps = {
  domain: string;
  year: number;
  author: string;
  name?: string;
  svgUrl?: string;
};

export type SkylineHandler = {
  download: () => void;
};


type ContributionData = {
  date: string;
  level: string;
}[]

const SkylineModel = forwardRef<SkylineHandler, SkylineProps>((props, ref) => {
  const { domain, year, author, name, svgUrl } = props;
  const skyline = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    download: () => downloadSTL(),
  }));

  const [contributionList, setContributionList] = useState<number[]>([]);

  useEffect(() => {
    axios
      .get(`https://fuck-u-cors.vercel.app/${ domain }/users/${ author }/contributions?to=${ year }-12-31`)
      .then(({ data }) => {
        const pattern = /data-date="([\d-]+)".*data-level="(\d+)"/g;

        const matches = [...data.matchAll(pattern)];

        const dataArray: ContributionData = matches.map(match => ({
          date: match[1],
          level: match[2]
        }));
        console.log(dataArray)
        dataArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // 打印排序后的结果
        dataArray.forEach(item => {
          console.log(`data-date: ${ item.date }, data-level: ${ item.level }`);
        });
        const arr = dataArray.map(item => parseInt(item.level));

        const startWeekday = new Date(year, 0, 1).getDay();
        const endWeekday = new Date(year, 12, 31).getDay();
        setContributionList(
          Array(startWeekday)
            .fill(0)
            .concat(arr)
            .concat(Array(6 - endWeekday).fill(0))
        );
      })
      .catch((err) => alert(err));
  }, []);

  const maxContributionsByDay = Math.max(...Object.values(contributionList));

  const baseTopWidth = 22;
  const baseWidth = 30;
  const baseLength = 146;
  const baseHeight = 8;
  const maxLengthContributionBar = 40;
  const barBaseDimension = 2.5;

  const baseTopOffset = (baseWidth - baseTopWidth) / 2;
  const faceAngle = 0.5 + Math.atan(baseHeight / baseTopOffset) * (180 / Math.PI);

  var vertices = new Float32Array([
    0,
    0,
    0,
    baseLength,
    0,
    0,
    baseLength,
    baseWidth,
    0,
    0,
    baseWidth,
    0,
    baseTopOffset,
    baseTopOffset,
    baseHeight,
    baseLength - baseTopOffset,
    baseTopOffset,
    baseHeight,
    baseLength - baseTopOffset,
    baseWidth - baseTopOffset,
    baseHeight,
    baseTopOffset,
    baseWidth - baseTopOffset,
    baseHeight,
  ]);

  var indices = new Uint16Array([
    0, 1, 2, 0, 2, 3, 2, 1, 2, 2, 2, 3, 0, 4, 5, 0, 5, 1, 1, 5, 6, 1, 6, 2, 2, 6, 7, 2, 7, 3, 3, 7, 4, 3, 4, 0, 4, 5, 6, 4, 6, 7, 6, 5, 6,
    6, 6, 7,
  ]);

  var geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  geometry.center();
  var material = new THREE.MeshNormalMaterial({
    side: THREE.DoubleSide,
  });
  var mesh = new THREE.Mesh(geometry, material);

  mesh.position.set(0, 0, 0);
  mesh.rotation.set(0, 0, 0);
  mesh.scale.set(1, 1, 1);
  const scene = new THREE.Scene();

  const pointLight = new THREE.PointLight(0xffffff, 1, 0);
  pointLight.position.set(0, 0, 100);
  scene.add(pointLight);

  const ambientLight = new THREE.AmbientLight(0x737373);
  scene.add(ambientLight);

  // 将 Mesh 对象添加到场景中
  scene.add(mesh);

  const font = fontLoader.parse(Typeface);
  const nick = name ?? author;
  const nickTextGeometry = new TextGeometry(nick, { font: font, size: 5, height: 2 });
  const nickTextMaterial = new THREE.MeshNormalMaterial();
  const nickTextMesh = new THREE.Mesh(nickTextGeometry, nickTextMaterial);
  nickTextMesh.position.set(-baseLength / 2.3, -baseWidth / 2.2, -baseHeight / 3 + 0.5);
  nickTextMesh.rotation.x = faceAngle;
  scene.add(nickTextMesh);

  const yearTextGeometry = new TextGeometry(year.toString(), { font: font, size: 5.5, height: 2 });
  const yearTextMaterial = new THREE.MeshNormalMaterial({});
  const yearTextMesh = new THREE.Mesh(yearTextGeometry, yearTextMaterial);
  yearTextMesh.position.set(baseLength / 3, -baseWidth / 2.2, -baseHeight / 3);
  yearTextMesh.rotation.x = faceAngle;
  scene.add(yearTextMesh);

  const svgLoader = new SVGLoader();
  svgLoader.load(svgUrl || Github, (data) => {
    const group = new THREE.Group();
    const paths = data.paths;

    const extrudeSettings = {
      steps: 1,
      depth: 20,
      bevelEnabled: false,
      bevelThickness: 1,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 1,
    };

    group.scale.multiplyScalar(0.075);
    for (let i = 0;i < paths.length;i++) {
      const path = paths[i];

      if (path.userData?.style.fill != "none") {
        const material = new THREE.MeshNormalMaterial({
          side: THREE.DoubleSide,
        });

        const shapes = path.toShapes(true);

        for (let j = 0;j < shapes.length;j++) {
          const shape = shapes[j];
          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          const mesh = new THREE.Mesh(geometry, material);
          group.add(mesh);
        }
      }
    }
    group.position.set(baseLength / 3.6 - 1, -baseWidth / 2.5 - 0.5, baseHeight / 2);
    group.rotation.x = faceAngle;
    // svg 被导入到 three.js 后是上下颠倒的
    group.rotation.z = Math.PI;
    group.rotation.y = Math.PI;
    scene.add(group);
  });

  const bars = new THREE.Group();

  let weekNumber = 1;
  for (let i = 0;i < contributionList.length;i++) {
    const dayNumber = 6 - (i % 7);
    if (dayNumber === 6) {
      weekNumber += 1;
    }
    const contribution = contributionList[i];
    if (contribution === 0) {
      continue;
    }

    const barGeometry = new THREE.BoxGeometry(
      barBaseDimension,
      barBaseDimension,
      (contribution * maxLengthContributionBar) / maxContributionsByDay
    );
    const barMaterial = new THREE.MeshNormalMaterial();
    const barMesh = new THREE.Mesh(barGeometry, barMaterial);
    barMesh.position.set(
      baseTopOffset + (weekNumber - 1) * barBaseDimension - baseLength / 2 + 1.5,
      baseTopOffset + dayNumber * barBaseDimension - baseWidth / 2 + 4,
      baseHeight / 2 + (contribution * maxLengthContributionBar) / (2 * maxContributionsByDay)
    );
    bars.add(barMesh);
  }

  scene.add(bars);
  const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, -80, 50);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);

  window.addEventListener("resize", () => {
    if (skyline && skyline.current) {
      const { width, height } = skyline.current.getBoundingClientRect();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  });

  const downloadSTL = () => {
    var exporter = new STLExporter();
    var txt = exporter.parse(scene);
    var blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    FileSaver.saveAs(blob, "export.stl");
  };

  if (skyline && skyline.current) {
    skyline.current.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();
  }

  return <div ref={ skyline } />;
});

export default SkylineModel;
