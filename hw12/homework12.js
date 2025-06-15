
document.addEventListener("DOMContentLoaded", () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(80, 2, 0.1, 50000);
    const renderer = new THREE.WebGLRenderer({  
	antialias: true
    });
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const geom = new THREE.BoxGeometry(20,20,20);

    const arjs = new THREEx.LocationBased(scene, camera);

    const cam = new THREEx.WebcamRenderer(renderer, '#video1');

    const mouseStep = 5*Math.PI/180;

    let orientationControls;

    if (isMobile()){   
        orientationControls = new THREEx.DeviceOrientationControls(camera);
    } 

    let fake = null;
    let first = true;

    arjs.on("gpsupdate", pos => {
        if(first) {
            setupObjects(pos.coords.longitude, pos.coords.latitude);
            first = false;
        }
    });

    arjs.on("gpserror", code => {
        alert("GPS error: code ${code}");
    });

    // Uncomment to use a fake GPS location
    //fake = { lat: 51.05, lon : -0.72 };
    if(fake) {
        arjs.fakeGps(fake.lon, fake.lat);
    } else {
        arjs.startGps();
    } 


    let mousedown = false, lastX = 0;

    // Mouse events for testing on desktop machine
    if(!isMobile()) {
        window.addEventListener("mousedown", e=> {
            mousedown = true;
        });

        window.addEventListener("mouseup", e=> {
            mousedown = false;
        });

        window.addEventListener("mousemove", e=> {
            if(!mousedown) return;
            if(e.clientX < lastX) {
                camera.rotation.y += mouseStep; 
                if(camera.rotation.y < 0) {
                    camera.rotation.y += 2 * Math.PI;
                }
            } else if (e.clientX > lastX) {
                camera.rotation.y -= mouseStep;
                if(camera.rotation.y > 2 * Math.PI) {
                    camera.rotation.y -= 2 * Math.PI;
                }
            }
            lastX = e.clientX;
        });
    }

	function isMobile() {
    	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        	// true for mobile device
        	return true;
    	}
    	return false;
	}

    function render(time) {
        resizeUpdate();
        if(orientationControls) orientationControls.update();
        cam.update();
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    function resizeUpdate() {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth, height = canvas.clientHeight;
        if(width != canvas.width || height != canvas.height) {
            renderer.setSize(width, height, false);
        }
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    function setupObjects(longitude, latitude) {
         const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // мʼяке світло
         scene.add(ambientLight);

         const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // основне
         directionalLight.position.set(100, 100, 100);
         scene.add(directionalLight);
	    
	 const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
   	 const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

   	 const box = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), boxMaterial);
   	 const sphere = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 32), sphereMaterial);

   	 arjs.add(box, longitude - 0.001, latitude);   // Куб зліва
  	  arjs.add(sphere, longitude + 0.001, latitude); // Сфера справа
     }
    requestAnimationFrame(render);
});
