import * as THREE from 'three';
import { MindARThree } from 'mindar';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

document.addEventListener("DOMContentLoaded", () => {
	const start = async () => {
		const mindarThree = new MindARThree({
			container: document.body,
			uiLoading: "yes",
			uiScanning: "yes",
			uiError: "no"
		});

		const { renderer, scene, camera } = mindarThree;

		const anchor_eyes = mindarThree.addAnchor(6); // перенісся

		const light = new THREE.HemisphereLight(0xffffff, 0xdddddd, 2.5);
		scene.add(light);

		const loader = new GLTFLoader();

		// Завантаження окулярів
		loader.load('doflamingo_glasses.glb', model => {
			console.log("Модель glasses завантажено", model);
			anchor_eyes.group.add(model.scene);
			model.scene.scale.set(0.08, 0.08, 0.08);
			model.scene.position.set(0, -0.3, 0.2);
			model.scene.rotation.x += 0 * Math.PI / 180;
			model.scene.rotation.y += 0 * Math.PI / 180;
			model.scene.rotation.z += 0 * Math.PI / 180;
		}, undefined, error => {
			console.log('Помилка завантаження моделі glasses', error);
		});

		// FaceMesh з маскою
		const faceMesh = mindarThree.addFaceMesh();
		faceMesh.material.map = new THREE.TextureLoader().load('Face_Mask_Template.png');
		faceMesh.material.transparent = true;
		scene.add(faceMesh);

		await mindarThree.start();

		// Показати відео фоном
		mindarThree.video.setAttribute("id", "mindar-video");

		renderer.setAnimationLoop(() => {
			renderer.render(scene, camera);
		});
	};

	start();
});