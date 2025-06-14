import * as THREE from 'three';
import { MindARThree } from 'mindar';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

document.addEventListener("DOMContentLoaded", () => {
	const start = async() => {
		const mindarThree = new MindARThree({
			container: document.body,
			imageTargetSrc: "catdog.mind",
			maxTrack: 2,
			uiLoading: "yes",
			uiScanning: "yes",
			uiError: "no"
		});

		const {renderer, scene, camera} = mindarThree;
		const anchor_cat = mindarThree.addAnchor(0);
		const anchor_dog = mindarThree.addAnchor(1);

		const video = document.getElementById("catdogvideo");
		const texture = new THREE.VideoTexture(video);

		const geometry = new THREE.PlaneGeometry(1, 1024/576);
                const material = new THREE.MeshBasicMaterial({map: texture});
		const plane = new THREE.Mesh(geometry, material);

		anchor_cat.group.add(plane);  // довільне відео

		anchor_cat.onTargetFound = () => {
			video.play();
		}
		anchor_cat.onTargetLost = () => {
			video.pause();
		}

		const loader = new GLTFLoader();

		let cat_model = false, dog_model = false, cat_mixer = false, dog_mixer = false;

                loader.load(
			// resource URL
			'dog.glb',
			// called when the resource is loaded
			function ( model ) {

				console.log("Модель собаки завантажено", model);
				anchor_dog.group.add( model.scene );
				dog_model = model;
				dog_model.scene.scale.set(0.15, 0.15, 0.15);
				dog_model.scene.position.set(-1, 0, 0);
				dog_mixer = new THREE.AnimationMixer(dog_model.scene);

				for(let i=0; i<  dog_model.animations.length; i++) {
					const action = dog_mixer.clipAction(dog_model.animations[i]);
					action.play();
				}


			},
			// called while loading is progressing
			function ( xhr ) {

				console.log( ( xhr.loaded / xhr.total * 100 ) + '% моделі собаки завантажено' );

			},
			// called when loading has errors
			function ( error ) {

				console.log( 'Помилка завантаження моделі собаки' );

			}
		);

		var light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
		scene.add(light);

                loader.load(
			// resource URL
			'cat.glb',
			// called when the resource is loaded
			function ( model ) {

				console.log("Модель кота завантажено", model);
				anchor_dog.group.add( model.scene );
				cat_model = model;
				cat_model.scene.scale.set(0.002, 0.002, 0.002);
				cat_model.scene.position.set(0.5, -0.5, 0);
				cat_mixer = new THREE.AnimationMixer(cat_model.scene);

				for(let i=0; i< cat_model.animations.length; i++) {
					const action = cat_mixer.clipAction(cat_model.animations[i]);
					action.play();
				}


			},
			// called while loading is progressing
			function ( xhr ) {

				console.log( ( xhr.loaded / xhr.total * 100 ) + '% моделі кота завантажено' );

			},
			// called when loading has errors
			function ( error ) {

				console.log( 'Помилка завантаження моделі кота' );

			}
		);		

		const clock = new THREE.Clock();

		await mindarThree.start();
		
		renderer.setAnimationLoop(() => {
			const delta = clock.getDelta();
			if(cat_mixer)
				cat_mixer.update(delta);
			if(dog_mixer)
				dog_mixer.update(delta);
			renderer.render(scene, camera);
			if(dog_model)
			dog_model.scene.rotation.y +=delta;
		});
	}
	start();
});


